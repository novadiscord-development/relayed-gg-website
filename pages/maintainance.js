import { useEffect, useState } from "react";

const messages = [
  "Checking gateway status...",
  "Reconnecting shards...",
  "Syncing server data...",
  "Need support? Join our Discord or email support@relayed.gg",
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
        timer = setTimeout(type, 38);
      } else {
        timer = setTimeout(() => {
          setText("");
          setMessageIndex((prev) => (prev + 1) % messages.length);
        }, 2200);
      }
    };

    type();
    return () => clearTimeout(timer);
  }, [messageIndex]);

  return (
    <main className="page">
      <aside className="serverRail">
        <div className="serverIcon active">R</div>
        <div className="serverIcon">⚙</div>
        <div className="serverIcon">?</div>
      </aside>

      <section className="sidebar">
        <div className="serverName">Relayed.gg</div>

        <div className="channel active"># maintenance</div>
        <div className="channel"># status</div>
        <div className="channel"># support</div>
        <div className="channel"># announcements</div>
      </section>

      <section className="chat">
        <header className="chatHeader">
          <span># maintenance</span>
          <small>Temporary service interruption</small>
        </header>

        <div className="chatBody">
          <div className="heroCard">
            <div className="orb" />

            <div className="botAvatar">R</div>

            <div>
              <div className="botLabel">
                Relayed Bot <span>BOT</span>
              </div>

              <h1>We’re doing some maintenance</h1>

              <p>
                Relayed is currently getting upgraded. We’re improving
                performance, reliability, and server syncing so everything feels
                smoother when we’re back online.
              </p>

              <div className="typeBox">
                <span className="typingDot" />
                <span>{text}</span>
                <b>|</b>
              </div>

              <div className="statusGrid">
                <div>
                  <strong>API</strong>
                  <small>Updating</small>
                </div>
                <div>
                  <strong>Dashboard</strong>
                  <small>Paused</small>
                </div>
                <div>
                  <strong>Support</strong>
                  <small>Online</small>
                </div>
              </div>
            </div>
          </div>

          <div className="message">
            <div className="avatar">R</div>
            <div>
              <strong>Relayed Bot</strong>
              <span> Today at maintenance o’clock</span>
              <p>
                Thanks for hanging tight. You can keep this tab open — we’ll be
                back as soon as updates finish.
              </p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 72px 260px 1fr;
          background: #313338;
          color: #f2f3f5;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
          overflow: hidden;
        }

        .serverRail {
          background: #1e1f22;
          padding: 12px 0;
          display: flex;
          align-items: center;
          flex-direction: column;
          gap: 12px;
        }

        .serverIcon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #313338;
          color: #dbdee1;
          font-weight: 800;
          transition: 0.2s;
        }

        .serverIcon.active,
        .serverIcon:hover {
          border-radius: 16px;
          background: #5865f2;
          color: white;
        }

        .sidebar {
          background: #2b2d31;
          padding: 16px;
          border-right: 1px solid rgba(0, 0, 0, 0.25);
        }

        .serverName {
          font-weight: 800;
          margin-bottom: 22px;
        }

        .channel {
          padding: 9px 12px;
          border-radius: 8px;
          color: #949ba4;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .channel.active,
        .channel:hover {
          background: #404249;
          color: white;
        }

        .chat {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .chatHeader {
          height: 52px;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 0 22px;
          background: #313338;
          border-bottom: 1px solid rgba(0, 0, 0, 0.25);
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .chatHeader span {
          font-weight: 800;
        }

        .chatHeader small {
          color: #949ba4;
        }

        .chatBody {
          flex: 1;
          padding: 40px;
          overflow: auto;
          background:
            radial-gradient(circle at 80% 20%, rgba(88, 101, 242, 0.22), transparent 32%),
            radial-gradient(circle at 20% 90%, rgba(35, 165, 90, 0.16), transparent 30%),
            #313338;
        }

        .heroCard {
          position: relative;
          display: grid;
          grid-template-columns: 72px 1fr;
          gap: 22px;
          max-width: 860px;
          padding: 34px;
          border-radius: 24px;
          overflow: hidden;
          background: rgba(43, 45, 49, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.32);
          backdrop-filter: blur(18px);
          animation: float 5s ease-in-out infinite;
        }

        .orb {
          position: absolute;
          width: 320px;
          height: 320px;
          right: -120px;
          top: -120px;
          border-radius: 50%;
          background: #5865f2;
          filter: blur(70px);
          opacity: 0.35;
          animation: pulseOrb 4s ease-in-out infinite;
        }

        .botAvatar,
        .avatar {
          width: 56px;
          height: 56px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          background: linear-gradient(135deg, #5865f2, #23a55a);
          font-weight: 900;
          box-shadow: 0 12px 30px rgba(88, 101, 242, 0.35);
        }

        .botLabel {
          color: #b5bac1;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .botLabel span {
          padding: 2px 5px;
          margin-left: 6px;
          border-radius: 4px;
          background: #5865f2;
          color: white;
          font-size: 0.65rem;
        }

        h1 {
          margin: 0;
          max-width: 720px;
          font-size: clamp(2.4rem, 6vw, 5rem);
          line-height: 0.95;
          letter-spacing: -0.06em;
        }

        p {
          max-width: 620px;
          color: #b5bac1;
          line-height: 1.7;
          font-size: 1.05rem;
        }

        .typeBox {
          margin-top: 24px;
          min-height: 56px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px 18px;
          border-radius: 14px;
          background: #1e1f22;
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: #dbdee1;
          font-weight: 700;
        }

        .typeBox b {
          animation: blink 0.8s infinite;
        }

        .typingDot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #23a55a;
          box-shadow: 0 0 0 rgba(35, 165, 90, 0.65);
          animation: ping 1.4s infinite;
        }

        .statusGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 18px;
        }

        .statusGrid div {
          padding: 16px;
          border-radius: 14px;
          background: #383a40;
        }

        .statusGrid strong,
        .statusGrid small {
          display: block;
        }

        .statusGrid small {
          color: #949ba4;
          margin-top: 4px;
        }

        .message {
          display: grid;
          grid-template-columns: 48px 1fr;
          gap: 16px;
          max-width: 760px;
          margin-top: 28px;
          padding: 18px;
          border-radius: 16px;
          animation: slideUp 0.7s ease both;
        }

        .message:hover {
          background: rgba(43, 45, 49, 0.5);
        }

        .message span {
          color: #949ba4;
          font-size: 0.9rem;
        }

        @keyframes float {
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulseOrb {
          50% {
            transform: scale(1.15);
            opacity: 0.5;
          }
        }

        @keyframes ping {
          70% {
            box-shadow: 0 0 0 10px rgba(35, 165, 90, 0);
          }
        }

        @keyframes blink {
          50% {
            opacity: 0;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 800px) {
          .page {
            grid-template-columns: 64px 1fr;
          }

          .sidebar {
            display: none;
          }

          .chatBody {
            padding: 22px;
          }

          .heroCard {
            grid-template-columns: 1fr;
            padding: 26px;
          }

          .statusGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}