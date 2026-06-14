export default function Maintenance() {
  return (
    <main className="page">
      <div className="stars" />
      <div className="orb orbOne" />
      <div className="orb orbTwo" />

      <div className="scene">
        <div className="gear gearOne">⚙</div>
        <div className="gear gearTwo">⚙</div>
        <div className="spark sparkOne" />
        <div className="spark sparkTwo" />
        <div className="spark sparkThree" />

        <h1>WHOOPS!</h1>
        <h2>We are currently under maintenance</h2>

        <p>
          Our team is tuning things up behind the scenes. Please check back
          shortly.
        </p>

        <div className="loader">
          <span />
          <span />
          <span />
        </div>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          background: radial-gradient(circle at top, #5865f2 0%, transparent 32%),
            linear-gradient(135deg, #0b1020, #111827 55%, #020617);
          color: white;
          font-family: Inter, system-ui, sans-serif;
          padding: 24px;
        }

        .scene {
          position: relative;
          z-index: 2;
          width: min(760px, 100%);
          padding: 70px 42px;
          text-align: center;
          border-radius: 36px;
          background: rgba(255, 255, 255, 0.09);
          border: 1px solid rgba(255, 255, 255, 0.16);
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(24px);
          animation: floatCard 4.5s ease-in-out infinite;
        }

        h1 {
          margin: 0;
          font-size: clamp(4rem, 13vw, 9rem);
          line-height: 0.9;
          letter-spacing: -0.08em;
          text-shadow: 0 0 35px rgba(88, 101, 242, 0.7);
          animation: pop 1.1s ease both, glow 2.4s ease-in-out infinite;
        }

        h2 {
          margin: 18px 0 0;
          font-size: clamp(1.5rem, 4vw, 2.8rem);
        }

        p {
          max-width: 520px;
          margin: 20px auto 0;
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.7;
          font-size: 1.05rem;
        }

        .gear {
          position: absolute;
          font-size: 64px;
          opacity: 0.8;
          filter: drop-shadow(0 0 20px rgba(88, 101, 242, 0.6));
        }

        .gearOne {
          top: 28px;
          left: 34px;
          animation: spin 5s linear infinite;
        }

        .gearTwo {
          right: 42px;
          bottom: 34px;
          font-size: 82px;
          animation: spinReverse 7s linear infinite;
        }

        .spark {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #facc15;
          box-shadow: 0 0 24px #facc15;
          animation: sparkMove 2.5s ease-in-out infinite;
        }

        .sparkOne {
          top: 22%;
          right: 22%;
        }

        .sparkTwo {
          bottom: 24%;
          left: 18%;
          animation-delay: -0.8s;
        }

        .sparkThree {
          top: 50%;
          left: 10%;
          animation-delay: -1.4s;
        }

        .loader {
          margin: 34px auto 0;
          display: flex;
          justify-content: center;
          gap: 10px;
        }

        .loader span {
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: #ffffff;
          animation: bounce 1.2s infinite ease-in-out;
        }

        .loader span:nth-child(2) {
          animation-delay: 0.15s;
        }

        .loader span:nth-child(3) {
          animation-delay: 0.3s;
        }

        .orb {
          position: absolute;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.45;
          animation: drift 9s ease-in-out infinite;
        }

        .orbOne {
          background: #5865f2;
          top: -120px;
          left: -110px;
        }

        .orbTwo {
          background: #22c55e;
          right: -140px;
          bottom: -140px;
          animation-delay: -4s;
        }

        .stars {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(#ffffff 1px, transparent 1px);
          background-size: 38px 38px;
          opacity: 0.12;
          animation: starsMove 18s linear infinite;
        }

        @keyframes floatCard {
          50% {
            transform: translateY(-16px) rotate(0.4deg);
          }
        }

        @keyframes pop {
          from {
            opacity: 0;
            transform: scale(0.86) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes glow {
          50% {
            text-shadow: 0 0 55px rgba(88, 101, 242, 1);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spinReverse {
          to {
            transform: rotate(-360deg);
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
            transform: translateY(-14px);
            opacity: 1;
          }
        }

        @keyframes drift {
          50% {
            transform: translate(70px, 40px) scale(1.12);
          }
        }

        @keyframes starsMove {
          to {
            background-position: 380px 380px;
          }
        }

        @keyframes sparkMove {
          0%,
          100% {
            transform: translate(0, 0) scale(0.8);
            opacity: 0.4;
          }
          50% {
            transform: translate(22px, -26px) scale(1.4);
            opacity: 1;
          }
        }

        @media (max-width: 640px) {
          .scene {
            padding: 58px 24px;
          }

          .gear {
            opacity: 0.35;
          }
        }
      `}</style>
    </main>
  );
}