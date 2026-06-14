import Image from "next/image";

export default function AppLoader({ label = "Connecting..." }) {
  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#050712] px-6 text-white">
      <div className="text-center">
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-violet-400/20 bg-violet-500/10 shadow-[0_0_55px_rgba(124,58,237,0.28)]">
          <div className="absolute inset-0 animate-ping rounded-3xl border border-violet-400/20" />

          <Image
            src="/logo.png"
            alt="Relayed"
            width={56}
            height={56}
            priority
            className="relative rounded-full"
          />
        </div>

        <h2 className="text-xl font-black">
          relayed<span className="text-violet-400">.gg</span>
        </h2>

        <p className="mt-2 text-sm text-slate-500">{label}</p>

        <div className="mx-auto mt-6 h-1.5 w-52 overflow-hidden rounded-full bg-white/[0.05]">
          <div className="h-full w-1/3 animate-[loadingBar_1.1s_ease-in-out_infinite] rounded-full bg-violet-500" />
        </div>
      </div>

      <style jsx>{`
        @keyframes loadingBar {
          0% {
            transform: translateX(-110%);
          }

          50% {
            transform: translateX(135%);
          }

          100% {
            transform: translateX(330%);
          }
        }
      `}</style>
    </div>
  );
}
