import { X } from "lucide-react";

export default function AttachmentPreviewBar({ attachments, setAttachments }) {
  if (!attachments?.length) return null;

  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {attachments.map((attachment, index) => (
        <div
          key={`${attachment.url}-${index}`}
          className="relative overflow-hidden rounded-xl border border-white/10 bg-black/30"
        >
          <img
            src={attachment.url}
            alt={attachment.name || "Image preview"}
            className="h-24 w-24 object-cover"
          />

          <button
            type="button"
            onClick={() =>
              setAttachments((prev) =>
                prev.filter((_, itemIndex) => itemIndex !== index)
              )
            }
            className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-red-500"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}