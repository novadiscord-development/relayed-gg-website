import FormattedMessage from "@/components/chat/FormattedMessage";

export default function EmbedCard({ embed, setPreviewImage }) {
  if (!embed) return null;

  const color = /^#[0-9A-Fa-f]{6}$/.test(embed.color || "")
    ? embed.color
    : "#7c3aed";

  return (
    <div
      className="mt-2 max-w-xl overflow-hidden rounded-xl border border-white/10 bg-white/[0.035]"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="p-4">
        <div className="flex gap-3">
          <div className="min-w-0 flex-1">
            {embed.title &&
              (embed.url ? (
                <a
                  href={embed.url}
                  target="_blank"
                  rel="noreferrer"
                  className="break-words text-sm font-black text-blue-300 hover:underline"
                >
                  <FormattedMessage content={embed.title} />
                </a>
              ) : (
                <div className="break-words text-sm font-black text-white">
                  <FormattedMessage content={embed.title} />
                </div>
              ))}

            {embed.description && (
              <div className="mt-2 text-sm text-slate-300">
                <FormattedMessage content={embed.description} />
              </div>
            )}
          </div>

          {embed.thumbnail && (
            <img
              src={embed.thumbnail}
              alt=""
              className="h-16 w-16 shrink-0 rounded-lg object-cover"
            />
          )}
        </div>

        {embed.image && (
          <button
            type="button"
            onClick={() => setPreviewImage(embed.image)}
            className="mt-4 overflow-hidden rounded-xl"
          >
            <img
              src={embed.image}
              alt=""
              className="max-h-72 w-full object-cover transition hover:opacity-90"
            />
          </button>
        )}

        {embed.footer && (
          <div className="mt-4 text-xs text-slate-500">
            <FormattedMessage content={embed.footer} />
          </div>
        )}
      </div>
    </div>
  );
}