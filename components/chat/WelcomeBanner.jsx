export default function WelcomeBanner({ channel }) {
  return (
    <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/20">
        <span className="text-4xl">#</span>
      </div>

      <h2 className="text-3xl font-black">
        Welcome to #{channel?.name || "channel"}!
      </h2>

      <p className="mt-2 text-slate-400">
        This is the start of the #{channel?.name || "channel"} channel.
      </p>
    </div>
  );
}