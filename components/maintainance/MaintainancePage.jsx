import { useEffect, useState } from "react";

const messages = [
  "Thanks for your patience — we will be back soon.",
  "Need help? Contact support at support@example.com.",
  "We are making things faster and smoother.",
  "Tip: Try again in a few minutes.",
];

export default function MaintenancePage() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    let i = 0;
    let timer;

    function type() {
      const message = messages[messageIndex];

      if (i <= message.length) {
        setText(message.slice(0, i));
        i++;
        timer = setTimeout(type, 45);
      } else {
        timer = setTimeout(() => {
          setText("");
          setMessageIndex((prev) => (prev + 1) % messages.length);
        }, 2000);
      }
    }

    type();
    return () => clearTimeout(timer);
  }, [messageIndex]);

  return (
    <main className="maintenancePage">
      <div className="maintenanceBlob blobOne" />
      <div className="maintenanceBlob blobTwo" />

      <section className="maintenanceCard">
        <div className="maintenancePill">
          <span className="maintenanceDot" />
          Maintenance in progress
        </div>

        <h1>We’ll be back shortly</h1>

        <p>
          We’re upgrading things behind the scenes to make your experience
          faster, smoother, and more reliable.
        </p>

        <div className="typewriter">
          {text}
          <span>|</span>
        </div>

        <div className="maintenanceStats">
          <div>
            <strong>Systems</strong>
            <small>Optimising</small>
          </div>
          <div>
            <strong>Status</strong>
            <small>Almost there</small>
          </div>
          <div>
            <strong>Support</strong>
            <small>Available</small>
          </div>
        </div>
      </section>
    </main>
  );
}