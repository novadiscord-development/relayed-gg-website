function parseInline(text) {
  const parts = text.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|~~[^~]+~~|`[^`]+`|@[a-zA-Z0-9_.-]+)/g);

  return parts.map((part, index) => {
    if (!part) return null;

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

    return part;
  });
}

export default function FormattedMessage({ content = "" }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-1 whitespace-pre-wrap break-words leading-[1.375rem] text-slate-100">
      {lines.map((line, index) => {
        if (line.startsWith("### ")) {
          return (
            <h3 key={index} className="text-lg font-black text-white">
              {parseInline(line.replace("### ", ""))}
            </h3>
          );
        }

        if (line.startsWith("## ")) {
          return (
            <h2 key={index} className="text-xl font-black text-white">
              {parseInline(line.replace("## ", ""))}
            </h2>
          );
        }

        if (line.startsWith("# ")) {
          return (
            <h1 key={index} className="text-2xl font-black text-white">
              {parseInline(line.replace("# ", ""))}
            </h1>
          );
        }

        if (line.startsWith("> ")) {
          return (
            <blockquote
              key={index}
              className="border-l-4 border-slate-600 pl-3 text-slate-300"
            >
              {parseInline(line.replace("> ", ""))}
            </blockquote>
          );
        }

        if (line.startsWith("- ")) {
          return (
            <p key={index} className="pl-4 text-slate-100">
              <span className="mr-2 text-slate-500">•</span>
              {parseInline(line.replace("- ", ""))}
            </p>
          );
        }

        return <p key={index}>{parseInline(line)}</p>;
      })}
    </div>
  );
}