export default function MessageAttachments({ message, setPreviewImage }) {
  const messageAttachments = message.attachments || [];

  if (!messageAttachments.length) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {messageAttachments.map((attachment, index) => {
        if (attachment.type !== "image") return null;

        return (
          <button
            key={`${attachment.url}-${index}`}
            type="button"
            onClick={() => setPreviewImage(attachment.url)}
            className="overflow-hidden rounded-xl border border-white/10 bg-black/20 transition hover:opacity-90"
          >
            <img
              src={attachment.url}
              alt={attachment.name || "Uploaded image"}
              className="max-h-[320px] max-w-[420px] object-contain"
            />
          </button>
        );
      })}
    </div>
  );
}