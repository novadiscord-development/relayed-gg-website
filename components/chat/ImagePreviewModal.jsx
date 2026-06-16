import { useEffect } from "react";

export default function ImagePreviewModal({ image, onClose }) {
  useEffect(() => {
    if (!image) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
    >
      <div className="max-h-full max-w-full">
        <img
          src={image}
          alt="Image preview"
          className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
          draggable={false}
        />
      </div>
    </div>
  );
}