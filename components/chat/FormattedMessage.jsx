function isUrl(value = "") {
  return /^(https?:\/\/|www\.)[^\s]+$/i.test(value);
}

function getHref(value = "") {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

function trimTrailingPunctuation(value = "") {
  const match = value.match(/^(.+?)([.,!?;:)]+)?$/);

  return {
    clean: match?.[1] || value,
    trailing: match?.[2] || "",
  };
}

function parseInline(text) {
  const parts = text.split(
    /((?:https?:\/\/|www\.)[^\s]+|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|~~[^~]+~~|`[^`]+`|@[a-zA-Z0-9_.-]+)/g
  );

  return parts.map((part, index) => {
    if (!part) return null;

    if (isUrl(part)) {
      const { clean, trailing } = trimTrailingPunctuation(part);

      return (
        <span key={index}>
          <a
            href={getHref(clean)}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-[#00a8fc] hover:underline"
          >
            {clean}
          </a>
          {trailing}
        </span>
      );
    }

    if (part.startsWith("***") && part.endsWith("***")) {
      return (
        <strong key={index} className="font-black italic">
          {part.slice(3, -3)}
        </strong>
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-black">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={index} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }

    if (part.startsWith("__") && part.endsWith("__")) {
      return (
        <span key={index} className="underline">
          {part.slice(2, -2)}
        </span>
      );
    }

    if (part.startsWith("~~") && part.endsWith("~~")) {
      return (
        <span key={index} className="line-through text-slate-400">
          {part.slice(2, -2)}
        </span>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-200"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith("@")) {
      return (
        <span
          key={index}
          className="rounded bg-violet-500/20 px-1 font-semibold text-violet-200"
        >
          {part}
        </span>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

export default function FormattedMessage({ content = "" }) {
  if (!content) return null;

  const lines = content.split("\n");

  return (
    <p className="whitespace-pre-wrap break-words text-slate-100">
      {lines.map((line, index) => (
        <span key={index}>
          {parseInline(line)}
          {index < lines.length - 1 && <br />}
        </span>
      ))}
    </p>
  );
}