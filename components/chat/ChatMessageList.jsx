import MessageItem from "@/components/chat/MessageItem";
import WelcomeBanner from "@/components/chat/WelcomeBanner";

export default function ChatMessageList({
  channel,
  loading,
  messages,
  loadingMore,
  hasMoreMessages,
  messagesContainerRef,
  bottomRef,
  messageRefs,
  session,
  currentMember,
  editingMessage,
  editContent,
  setEditContent,
  highlightedMessageId,
  setEditingMessage,
  setReplyingTo,
  getAuthorId,
  formatTime,
  renderMessageContent,
  openUserProfile,
  startReply,
  handleSaveEdit,
  handleDeleteMessage,
  cancelEdit,
  setPreviewImage,
}) {
  return (
    <div
      ref={messagesContainerRef}
      className="min-h-0 flex-1 overflow-y-auto px-6 py-6"
    >
      <WelcomeBanner channel={channel} />

      {loading ? (
        <p className="text-sm text-slate-500">Loading messages...</p>
      ) : messages.length === 0 ? (
        <p className="text-sm text-slate-500">
          No messages yet. Start the conversation.
        </p>
      ) : (
        <div className="space-y-0">
          {loadingMore && (
            <p className="py-3 text-center text-xs text-slate-500">
              Loading older messages...
            </p>
          )}

          {!hasMoreMessages && messages.length > 0 && (
            <p className="py-3 text-center text-xs text-slate-600">
              Beginning of channel
            </p>
          )}

          {messages.map((message, index) => (
            <MessageItem
              key={message._id}
              message={message}
              previousMessage={messages[index - 1]}
              session={session}
              currentMember={currentMember}
              editingMessage={editingMessage}
              editContent={editContent}
              setEditContent={setEditContent}
              highlightedMessageId={highlightedMessageId}
              setEditingMessage={setEditingMessage}
              setReplyingTo={setReplyingTo}
              messageRefs={messageRefs}
              getAuthorId={getAuthorId}
              formatTime={formatTime}
              openUserProfile={openUserProfile}
              startReply={startReply}
              handleSaveEdit={handleSaveEdit}
              handleDeleteMessage={handleDeleteMessage}
              cancelEdit={cancelEdit}
              setPreviewImage={setPreviewImage}
            />
          ))}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}