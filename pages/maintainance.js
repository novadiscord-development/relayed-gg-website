import { useEffect, useState } from "react";

const messages = [
  "We're deploying new features...",
  "Optimising performance and reliability...",
  "Need help? support@relayed.gg",
  "Thanks for your patience ❤️",
];

export default function Maintenance() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    let i = 0;
    let timer;

    const type = () => {
      const message = messages[messageIndex];

      if (i <= message.length) {
        setText(message.slice(0, i));
        i++;
        timer = setTimeout(type, 40);
      } else {
        timer = setTimeout(() => {
          setText("");
          setMessageIndex((prev) => (prev + 1) % messages.length);
        }, 2500);
      }
    };

    type();

    return () => clearTimeout(timer);
  }, [messageIndex]);

  return (
    <div className="maintenance">
      <div className="blob blob1" />
      <div className="blob blob2" />

      <div className="glass">
        <span className="badge">
          <span className="dot" />
          Maintenance Mode
        </span>

        <h1>Relayed</h1>

        <h2>We're making things better.</h2>

        <p>
          Our engineers are currently performing upgrades to improve
          reliability, speed and overall experience.
        </p>

        <div className="typewriter">
          {text}
          <span className="cursor">|</span>
        </div>
      </div>

      <style jsx>{`
        .maintenance {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #050816;
          overflow: hidden;
          position: relative;
        }

        .glass {
          width: 700px;
          max-width: 90%;
          padding: 60px;
          border-radius: 32px;
          backdrop-filter: blur(25px);
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          text-align: center;
          z-index: 2;
        }

        h1 {
          font-size: 5rem;
          margin: 20px 0 0;
        }

        h2 {
          font-size: 2rem;
          margin-bottom: 20px;
        }

        p {
          opacity: 0.75;
          line-height: 1.8;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 18px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
        }

        .dot {
          width: 10px;
          height: 10px;
          background: #22c55e;
          border-radius: 999px;
          animation: pulse 1.5s infinite;
        }

        .typewriter {
          margin-top: 40px;
          font-size: 1.1rem;
          color: #67e8f9;
          min-height: 40px;
        }

        .cursor {
          animation: blink 1s infinite;
        }

        .blob {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 999px;
          filter: blur(100px);
          opacity: 0.4;
        }

        .blob1 {
          background: #8b5cf6;
          top: -150px;
          left: -150px;
        }

        .blob2 {
          background: #06b6d4;
          bottom: -150px;
          right: -150px;
        }

        @keyframes pulse {
          50% {
            transform: scale(1.4);
          }
        }

        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}