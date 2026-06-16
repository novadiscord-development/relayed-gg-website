function parseInline(text, users = []) {
  const usernames = new Set(users.map((u) => u.username.toLowerCase()));

  const parts = text.split(
    /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|~~[^~]+~~|`[^`]+`|@[a-zA-Z0-9_.-]+)/g
  );

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith("***") && part.endsWith("***")) {
      return <strong key={index} className="font-black italic">{part.slice(3, -3)}</strong>;
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-black">{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index} className="italic">{part.slice(1, -1)}</em>;
    }

    if (part.startsWith("__") && part.endsWith("__")) {
      return <span key={index} className="underline">{part.slice(2, -2)}</span>;
    }

    if (part.startsWith("~~") && part.endsWith("~~")) {
      return <span key={index} className="line-through text-slate-400">{part.slice(2, -2)}</span>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-200">
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith("@")) {
      const username = part.slice(1).toLowerCase();

      if (!usernames.has(username)) {
        return part;
      }

      return (
        <span key={index} className="rounded bg-violet-500/20 px-1 font-semibold text-violet-200">
          {part}
        </span>
      );
    }

    return part;
  });
}

export default function FormattedMessage({ content = "", users = [] }) {
  if (!content) return null;

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);

  return (
    <p className="whitespace-pre-wrap break-words text-slate-100">
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00a8fc] hover:underline"
            >
              {part}
            </a>
          );
        }

        return parseInline(part, users);
      })}
    </p>
  );
}