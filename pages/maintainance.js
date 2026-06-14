export default function Maintenance() {
  return (
    <main className="page">
      <div className="grid" />
      <div className="stars" />
      <div className="orb orbOne" />
      <div className="orb orbTwo" />
      <div className="orb orbThree" />

      <section className="scene" aria-labelledby="maintenance-title">
        <div className="badge">
          <span className="statusDot" />
          Scheduled maintenance
        </div>

        <div className="logoWrap">
          <div className="pulseRing" />
          <img src="/logo.png" alt="Relayed.gg" className="logo" />
        </div>

        <h1 id="maintenance-title">
          relayed<span>.gg</span>
        </h1>

        <h2>We&rsquo;re tuning things up</h2>

        <p>
          Relayed is temporarily offline while we upgrade a few systems behind
          the scenes. Your servers, messages, and settings are safe.
        </p>

        <div className="loader" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="footerText">
          <span>Thanks for your patience.</span>
          <span className="divider" />
          <span>We&rsquo;ll be back shortly.</span>
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          background:
            radial-gradient(circle at top, rgba(124, 58, 237, 0.28), transparent 38%),
            radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.16), transparent 34%),
            linear-gradient(135deg, #050712, #080b18 48%, #020617);
          color: white;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
          padding: 24px;
        }

        .scene {
          position: relative;
          z-index: 3;
          width: min(760px, 100%);
          padding: 58px 42px;
          text-align: center;
          border-radius: 34px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.09),
            rgba(255, 255, 255, 0.035)
          );
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow:
            0 30px 100px rgba(0, 0, 0, 0.55),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(24px);
          animation: floatCard 5s ease-in-out infinite;
        }

        .badge {
          width: fit-content;
          margin: 0 auto 26px;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          border-radius: 999px;
          border: 1px solid rgba(167, 139, 250, 0.24);
          background: rgba(124, 58, 237, 0.12);
          color: #ddd6fe;
          padding: 9px 14px;
          font-size: 0.78rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .statusDot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #a78bfa;
          box-shadow: 0 0 22px rgba(167, 139, 250, 0.95);
          animation: statusPulse 1.7s ease-in-out infinite;
        }

        .logoWrap {
          position: relative;
          width: 104px;
          height: 104px;
          margin: 0 auto 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 30px;
          border: 1px solid rgba(167, 139, 250, 0.25);
          background: rgba(124, 58, 237, 0.1);
          box-shadow: 0 0 55px rgba(124, 58, 237, 0.28);
        }

        .pulseRing {
          position: absolute;
          inset: 0;
          border-radius: 30px;
          border: 1px solid rgba(167, 139, 250, 0.28);
          animation: ping 1.9s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .logo {
          position: relative;
          width: 62px;
          height: 62px;
          border-radius: 999px;
          object-fit: cover;
        }

        h1 {
          margin: 0;
          font-size: clamp(3.25rem, 10vw, 7.5rem);
          line-height: 0.9;
          letter-spacing: -0.08em;
          font-weight: 1000;
          text-shadow: 0 0 42px rgba(124, 58, 237, 0.65);
          animation: pop 900ms ease both, glow 2.6s ease-in-out infinite;
        }

        h1 span {
          color: #a78bfa;
        }

        h2 {
          margin: 20px 0 0;
          font-size: clamp(1.45rem, 4vw, 2.6rem);
          letter-spacing: -0.04em;
          font-weight: 1000;
        }

        p {
          max-width: 560px;
          margin: 18px auto 0;
          color: rgba(226, 232, 240, 0.76);
          line-height: 1.75;
          font-size: 1.02rem;
        }

        .loader {
          margin: 34px auto 0;
          display: flex;
          justify-content: center;
          gap: 10px;
        }

        .loader span {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #a78bfa;
          box-shadow: 0 0 24px rgba(167, 139, 250, 0.75);
          animation: bounce 1.2s infinite ease-in-out;
        }

        .loader span:nth-child(2) {
          animation-delay: 0.15s;
        }

        .loader span:nth-child(3) {
          animation-delay: 0.3s;
        }

        .footerText {
          margin: 30px auto 0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          color: rgba(148, 163, 184, 0.82);
          font-size: 0.88rem;
          font-weight: 700;
        }

        .divider {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(148, 163, 184, 0.55);
        }

        .orb {
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          filter: blur(86px);
          opacity: 0.42;
          animation: drift 10s ease-in-out infinite;
          pointer-events: none;
        }

        .orbOne {
          background: #7c3aed;
          top: -150px;
          left: -130px;
        }

        .orbTwo {
          background: #06b6d4;
          right: -160px;
          bottom: -160px;
          animation-delay: -4s;
        }

        .orbThree {
          width: 320px;
          height: 320px;
          background: #4f46e5;
          left: 50%;
          bottom: -220px;
          transform: translateX(-50%);
          animation-delay: -7s;
        }

        .stars {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.9) 1px, transparent 1px);
          background-size: 42px 42px;
          opacity: 0.1;
          animation: starsMove 22s linear infinite;
          pointer-events: none;
        }

        .grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(to right, rgba(255, 255, 255, 0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(circle at center, black, transparent 72%);
          opacity: 0.36;
          pointer-events: none;
        }

        @keyframes floatCard {
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes pop {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(16px);
          }

          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes glow {
          50% {
            text-shadow: 0 0 64px rgba(124, 58, 237, 0.95);
          }
        }

        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: translateY(0);
            opacity: 0.45;
          }

          40% {
            transform: translateY(-13px);
            opacity: 1;
          }
        }

        @keyframes drift {
          50% {
            transform: translate(70px, 38px) scale(1.12);
          }
        }

        @keyframes starsMove {
          to {
            background-position: 420px 420px;
          }
        }

        @keyframes ping {
          75%,
          100% {
            transform: scale(1.35);
            opacity: 0;
          }
        }

        @keyframes statusPulse {
          50% {
            opacity: 0.35;
            transform: scale(0.82);
          }
        }

        @media (max-width: 640px) {
          .page {
            padding: 16px;
          }

          .scene {
            padding: 42px 22px;
            border-radius: 28px;
          }

          .logoWrap {
            width: 88px;
            height: 88px;
            border-radius: 26px;
          }

          .pulseRing {
            border-radius: 26px;
          }

          .logo {
            width: 54px;
            height: 54px;
          }

          p {
            font-size: 0.95rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .scene,
          .stars,
          .orb,
          .pulseRing,
          .loader span,
          .statusDot,
          h1 {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
