import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { getPusherClient } from "@/lib/pusher-client";

import UserProfilePopout from "@/components/users/UserProfilePopout";
import AttachmentPreviewBar from "@/components/chat/AttachmentPreviewBar";
import ChatInputBar from "@/components/chat/ChatInputBar";
import ChatMessageList from "@/components/chat/ChatMessageList";
import EmbedComposer from "@/components/chat/EmbedComposer";
import ImagePreviewModal from "@/components/chat/ImagePreviewModal";
import MentionPicker from "@/components/chat/MentionPicker";
import ReplyBar from "@/components/chat/ReplyBar";
import TypingIndicator from "@/components/chat/TypingIndicator";

const emptyEmbed = {
  content: "",
  title: "",
  description: "",
  color: "#7c3aed",
  image: "",
  thumbnail: "",
  footer: "",
};

export default function ChatArea() {
  const router = useRouter();
  const { serverId, channelId } = router.query;
  const { data: session } = useSession();

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastTypingAtRef = useRef(0);
  const typingTimeoutsRef = useRef({});
  const messageRefs = useRef({});

  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [currentMember, setCurrentMember] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [oldestMessageAt, setOldestMessageAt] = useState(null);

  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentions, setShowMentions] = useState(false);

  const [replyingTo, setReplyingTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);

  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState("");

  const [showEmbedComposer, setShowEmbedComposer] = useState(false);
  const [embed, setEmbed] = useState(emptyEmbed);
  const [sendingEmbed, setSendingEmbed] = useState(false);

  function memberHasPermission(member, permission) {
    if (!member) return false;

    if (["owner", "admin"].includes(member.role)) {
      return true;
    }

    if (permission === "sendMessages" && ["moderator", "member"].includes(member.role)) {
      return true;
    }

    if (permission === "attachFiles" && ["moderator", "member"].includes(member.role)) {
      return true;
    }

    if (permission === "manageMessages" && member.role === "moderator") {
      return true;
    }

    return member.roles?.some((role) => Boolean(role.permissions?.[permission]));
  }

  const canCreateEmbeds =
    memberHasPermission(currentMember, "manageMessages") ||
    memberHasPermission(currentMember, "mentionEveryone");

  useEffect(() => {
    if (!serverId || !channelId) return;

    messageRefs.current = {};
    setMessages([]);
    setTypingUsers([]);
    setHasMoreMessages(true);
    setOldestMessageAt(null);
    setSelectedMember(null);
    setPreviewImage(null);
    setAttachments([]);
    setReplyingTo(null);
    setEditingMessage(null);
    setEditContent("");
    setShowMentions(false);
    setMentionQuery("");
    setShowEmbedComposer(false);
    setEmbed(emptyEmbed);

    loadChannel();
    loadMessages(true);
    loadMembers();

    requestAnimationFrame(() => inputRef.current?.focus());
  }, [serverId, channelId]);

  useEffect(() => {
    if (!channelId) return;

    const pusherClient = getPusherClient();
    const pusherChannel = pusherClient.subscribe(`channel-${channelId}`);

    function handleNewMessage(message) {
      setMessages((prev) =>
        prev.some((item) => item._id === message._id)
          ? prev
          : [...prev, message]
      );

      removeTypingUser(message.authorId?._id || message.authorId);
    }

    function handleUpdatedMessage(updatedMessage) {
      setMessages((prev) =>
        prev.map((message) =>
          message._id === updatedMessage._id ? updatedMessage : message
        )
      );
    }

    function handleDeletedMessage({ messageId }) {
      setMessages((prev) =>
        prev.filter((message) => message._id !== messageId)
      );

      if (replyingTo?._id === messageId) setReplyingTo(null);

      if (editingMessage?._id === messageId) {
        setEditingMessage(null);
        setEditContent("");
      }
    }

    function handleTyping(user) {
      if (!user?.userId || user.userId === session?.user?.id) return;

      setTypingUsers((prev) => {
        const exists = prev.some((item) => item.userId === user.userId);
        return exists
          ? prev.map((item) => (item.userId === user.userId ? user : item))
          : [...prev, user];
      });

      clearTimeout(typingTimeoutsRef.current[user.userId]);
      typingTimeoutsRef.current[user.userId] = setTimeout(() => {
        removeTypingUser(user.userId);
      }, 3000);
    }

    pusherChannel.bind("message:new", handleNewMessage);
    pusherChannel.bind("message:update", handleUpdatedMessage);
    pusherChannel.bind("message:delete", handleDeletedMessage);
    pusherChannel.bind("user:typing", handleTyping);

    return () => {
      pusherChannel.unbind("message:new", handleNewMessage);
      pusherChannel.unbind("message:update", handleUpdatedMessage);
      pusherChannel.unbind("message:delete", handleDeletedMessage);
      pusherChannel.unbind("user:typing", handleTyping);
      pusherClient.unsubscribe(`channel-${channelId}`);

      Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
      typingTimeoutsRef.current = {};
    };
  }, [channelId, session?.user?.id, replyingTo?._id, editingMessage?._id]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    async function handleScroll() {
      if (
        container.scrollTop > 150 ||
        !hasMoreMessages ||
        loadingMore ||
        loading
      ) {
        return;
      }

      const previousHeight = container.scrollHeight;
      await loadMessages(false);

      requestAnimationFrame(() => {
        container.scrollTop += container.scrollHeight - previousHeight;
      });
    }

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMoreMessages, loadingMore, loading, oldestMessageAt, channelId]);

  useEffect(() => {
    if (!loadingMore) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loadingMore]);

  function focusInput() {
    if (
      editingMessage ||
      showEmbedComposer ||
      selectedMember ||
      document.activeElement === inputRef.current
    ) {
      return;
    }

    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function removeTypingUser(userId) {
    if (!userId) return;

    clearTimeout(typingTimeoutsRef.current[userId]);
    delete typingTimeoutsRef.current[userId];

    setTypingUsers((prev) => prev.filter((item) => item.userId !== userId));
  }

  async function sendTypingEvent() {
    if (!channelId || editingMessage || showEmbedComposer) return;

    const now = Date.now();
    if (now - lastTypingAtRef.current < 1500) return;

    lastTypingAtRef.current = now;

    fetch("/api/messages/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId }),
    }).catch(() => {});
  }

  function getAuthorId(message) {
    const author = message?.authorId;
    return (author?._id || author || "").toString();
  }

  function findMemberByUser(user) {
    const userId = (user?._id || user || "").toString();

    return (
      members.find((member) => member.userId?._id?.toString() === userId) || {
        _id: userId,
        role: "member",
        userId: user,
      }
    );
  }

  function openUserProfile(user) {
    if (!user) return;
    setSelectedMember(findMemberByUser(user));
  }

  async function loadChannel() {
    try {
      const res = await fetch(`/api/channels/get-channels?serverId=${serverId}`);
      const data = await res.json();

      setChannel(data.channels?.find((item) => item._id === channelId) || null);
    } catch (error) {
      console.error("LOAD_CHANNEL_ERROR", error);
    }
  }

  async function loadMembers() {
    try {
      const res = await fetch(`/api/servers/get-members?serverId=${serverId}`);
      const data = await res.json();

      if (res.ok) {
        setMembers(data.members || []);
        setCurrentMember(data.currentMember || null);
      }
    } catch (error) {
      console.error("LOAD_MEMBERS_ERROR", error);
    }
  }

  async function loadMessages(initial = true) {
    try {
      initial ? setLoading(true) : setLoadingMore(true);

      let url = `/api/messages/get-messages?channelId=${channelId}`;

      if (!initial && oldestMessageAt) {
        url += `&before=${encodeURIComponent(oldestMessageAt)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) return;

      setMessages((prev) =>
        initial ? data.messages || [] : [...(data.messages || []), ...prev]
      );

      setHasMoreMessages(Boolean(data.hasMore));
      setOldestMessageAt(data.oldestMessageAt || null);
    } catch (error) {
      console.error("LOAD_MESSAGES_ERROR", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  function handleContentChange(e) {
    const value = e.target.value;

    if (value.trim() === "/embed" && canCreateEmbeds) {
      setContent("");
      setShowEmbedComposer(true);
      return;
    }

    setContent(value);

    if (value.trim()) sendTypingEvent();

    const match = value.match(/(^|\s)@([a-zA-Z0-9_.-]*)$/);

    if (match) {
      setMentionQuery(match[2].toLowerCase());
      setShowMentions(true);
    } else {
      setShowMentions(false);
      setMentionQuery("");
    }
  }

  async function uploadChatImage(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert("Image must be under 8MB.");
      return;
    }

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/chat-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Image upload failed");
        return;
      }

      setAttachments((prev) => [...prev, data.attachment]);
      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (error) {
      console.error("UPLOAD_SERVER_IMAGE_ERROR", error);
      alert("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleImageSelect(e) {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    await uploadChatImage(file);
  }

  async function handlePaste(e) {
    if (editingMessage || showEmbedComposer || uploadingImage) return;

    const items = Array.from(e.clipboardData?.items || []);
    const imageItem = items.find((item) => item.type.startsWith("image/"));

    if (!imageItem) return;

    const file = imageItem.getAsFile();

    if (!file) return;

    e.preventDefault();
    await uploadChatImage(file);
  }

  const pingableMembers = members
    .filter((member) => member.userId?.username)
    .filter((member) =>
      member.userId.username.toLowerCase().includes(mentionQuery)
    )
    .slice(0, 8);

  function insertMention(member) {
    setContent((prev) =>
      prev.replace(/(^|\s)@([a-zA-Z0-9_.-]*)$/, `$1@${member.userId.username} `)
    );

    setShowMentions(false);
    setMentionQuery("");
    focusInput();
  }

  function startReply(message) {
    setReplyingTo(message);
    setEditingMessage(null);
    setEditContent("");
    focusInput();
  }

  async function sendMessage(e) {
    e.preventDefault();

    if (
      (!content.trim() && attachments.length === 0) ||
      sending ||
      showEmbedComposer
    ) {
      focusInput();
      return;
    }

    const messageContent = content;
    const messageAttachments = attachments;
    const replyToId = replyingTo?._id || null;

    setSending(true);
    setContent("");
    setAttachments([]);
    setShowMentions(false);
    setReplyingTo(null);
    focusInput();

    try {
      const res = await fetch("/api/messages/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId,
          content: messageContent,
          replyToId,
          attachments: messageAttachments,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("SEND_MESSAGE_FAILED", data);
        setContent(messageContent);
        setAttachments(messageAttachments);
        setReplyingTo(replyingTo);
        focusInput();
        return;
      }

      setMessages((prev) =>
        prev.some((item) => item._id === data.message._id)
          ? prev
          : [...prev, data.message]
      );
    } catch (error) {
      console.error("SEND_MESSAGE_ERROR", error);
      setContent(messageContent);
      setAttachments(messageAttachments);
      setReplyingTo(replyingTo);
    } finally {
      setSending(false);
      focusInput();
    }
  }

  async function sendEmbed() {
    if (sendingEmbed || (!embed.title.trim() && !embed.description.trim())) {
      return;
    }

    try {
      setSendingEmbed(true);

      const res = await fetch("/api/messages/send-embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, ...embed }),
      });

      const data = await res.json();

      if (!res.ok) return;

      setMessages((prev) =>
        prev.some((item) => item._id === data.message._id)
          ? prev
          : [...prev, data.message]
      );

      setEmbed(emptyEmbed);
      setShowEmbedComposer(false);
      focusInput();
    } catch (error) {
      console.error("SEND_EMBED_ERROR", error);
    } finally {
      setSendingEmbed(false);
    }
  }

  async function handleSaveEdit() {
    if (!editingMessage || !editContent.trim()) return;

    const res = await fetch("/api/messages/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageId: editingMessage._id,
        content: editContent,
      }),
    });

    const data = await res.json();

    if (!res.ok) return;

    setMessages((prev) =>
      prev.map((message) =>
        message._id === data.message._id ? data.message : message
      )
    );

    setEditingMessage(null);
    setEditContent("");
    focusInput();
  }

  async function handleDeleteMessage(message) {
    if (!confirm("Delete this message?")) {
      focusInput();
      return;
    }

    const res = await fetch("/api/messages/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: message._id }),
    });

    if (!res.ok) return;

    setMessages((prev) => prev.filter((item) => item._id !== message._id));

    if (replyingTo?._id === message._id) setReplyingTo(null);

    if (editingMessage?._id === message._id) {
      setEditingMessage(null);
      setEditContent("");
    }

    focusInput();
  }

  async function handleToggleReaction(message, emoji) {
    try {
      const res = await fetch("/api/messages/toggle-reaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId: message._id,
          emoji,
        }),
      });

      const data = await res.json();

      if (!res.ok) return;

      setMessages((prev) =>
        prev.map((item) =>
          item._id === data.message._id ? data.message : item
        )
      );
    } catch (error) {
      console.error("TOGGLE_REACTION_ERROR", error);
    }
  }

  async function handleTogglePin(message) {
    try {
      const res = await fetch("/api/messages/toggle-pin", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId: message._id,
        }),
      });

      const data = await res.json();

      if (!res.ok) return;

      setMessages((prev) =>
        prev.map((item) =>
          item._id === data.message._id ? data.message : item
        )
      );
    } catch (error) {
      console.error("TOGGLE_PIN_ERROR", error);
    }
  }

  function cancelEdit() {
    setEditingMessage(null);
    setEditContent("");
    focusInput();
  }

  function formatTime(date) {
    return new Date(date).toLocaleString([], {
      hour: "numeric",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <>
      <section
        onPaste={handlePaste}
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#080b18]"
      >
        <ChatMessageList
          channel={channel}
          loading={loading}
          messages={messages}
          loadingMore={loadingMore}
          hasMoreMessages={hasMoreMessages}
          messagesContainerRef={messagesContainerRef}
          bottomRef={bottomRef}
          messageRefs={messageRefs}
          session={session}
          currentMember={currentMember}
          editingMessage={editingMessage}
          editContent={editContent}
          setEditContent={setEditContent}
          highlightedMessageId={null}
          setEditingMessage={setEditingMessage}
          setReplyingTo={setReplyingTo}
          getAuthorId={getAuthorId}
          formatTime={formatTime}
          openUserProfile={openUserProfile}
          startReply={startReply}
          handleSaveEdit={handleSaveEdit}
          handleDeleteMessage={handleDeleteMessage}
          onToggleReaction={handleToggleReaction}
          onTogglePin={handleTogglePin}
          cancelEdit={cancelEdit}
          setPreviewImage={setPreviewImage}
        />

        <form
          onSubmit={sendMessage}
          onMouseDown={(e) => e.stopPropagation()}
          className="relative shrink-0 border-t border-white/10 bg-[#080b18] px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 md:p-4"
        >
          {showMentions && (
            <MentionPicker
              members={pingableMembers}
              insertMention={insertMention}
              openUserProfile={openUserProfile}
            />
          )}

          <AttachmentPreviewBar
            attachments={attachments}
            setAttachments={setAttachments}
          />

          <ReplyBar
            replyingTo={replyingTo}
            openUserProfile={openUserProfile}
            onCancel={() => {
              setReplyingTo(null);
              focusInput();
            }}
          />

          <TypingIndicator typingUsers={typingUsers} />

          {showEmbedComposer && (
            <EmbedComposer
              embed={embed}
              setEmbed={setEmbed}
              emptyEmbed={emptyEmbed}
              sendingEmbed={sendingEmbed}
              sendEmbed={sendEmbed}
              setPreviewImage={setPreviewImage}
              onClose={() => {
                setShowEmbedComposer(false);
                setEmbed(emptyEmbed);
                focusInput();
              }}
            />
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          <ChatInputBar
            channel={channel}
            content={content}
            setContent={setContent}
            inputRef={inputRef}
            fileInputRef={fileInputRef}
            uploadingImage={uploadingImage}
            editingMessage={editingMessage}
            showEmbedComposer={showEmbedComposer}
            canCreateEmbeds={canCreateEmbeds}
            handleContentChange={handleContentChange}
            handlePaste={handlePaste}
            setShowEmbedComposer={setShowEmbedComposer}
            focusInput={focusInput}
            sendMessage={sendMessage}
          />
        </form>
      </section>

      {selectedMember && (
        <UserProfilePopout
          user={selectedMember.userId}
          member={selectedMember}
          currentMember={currentMember}
          serverId={serverId}
          presence={{ status: "offline", customStatus: "" }}
          onClose={() => {
            setSelectedMember(null);
            focusInput();
          }}
        />
      )}

      <ImagePreviewModal
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </>
  );
}