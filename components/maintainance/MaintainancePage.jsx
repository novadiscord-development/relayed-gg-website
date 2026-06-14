import { useEffect, useState } from "react";

const messages = [
  "Tip: Try refreshing in a few minutes.",
  "Need help? Contact support at support@example.com.",
  "We are improving performance behind the scenes.",
  "Thanks for your patience — we will be back soon.",
];

export default function MaintenancePage() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let charIndex = 0;
    let timeout;

    const type = () => {
      const currentMessage = messages[messageIndex];

      if (charIndex <= currentMessage.length) {
        setDisplayedText(currentMessage.slice(0, charIndex));
        charIndex++;
        timeout = setTimeout(type, 45);
      } else {
        timeout = setTimeout(() => {
          setMessageIndex((prev) => (prev + 1) % messages.length);
          setDisplayedText("");
        }, 2200);
      }
    };

    type();

    return () => clearTimeout(timeout);
  }, [messageIndex]);

  return (
    <main className="maintenance-page">
      <div className="blob blob-one" />
      <div className="blob blob-two" />
      <div className="blob blob-three" />

      <section className="maintenance-card">
        <div className="status-pill">
          <span className="pulse-dot" />
          Maintenance in progress
        </div>

        <h1>We’ll be back shortly</h1>

        <p className="subtitle">
          We’re upgrading things behind the scenes to make your experience
          faster, smoother, and more reliable.
        </p>

        <div className="typewriter-box">
          <span>{displayedText}</span>
          <span className="cursor">|</span>
        </div>

        <div className="progress-wrap">
          <div className="progress-bar" />
        </div>

        <div className="mini-grid">
          <div>
            <strong>Systems</strong>
            <span>Optimising</span>
          </div>
          <div>
            <strong>Status</strong>
            <span>Almost there</span>
          </div>
          <div>
            <strong>Support</strong>
            <span>Available</span>
          </div>
        </div>
      </section>
    </main>
  );
}