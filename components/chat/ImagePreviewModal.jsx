export default function ImagePreviewModal({ image, onClose }) {
  if (!image) return null;

  return (
    <div
      onMouseDown={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
    >
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        className="max-h-full max-w-full"
      >
        <img
          src={image}
          alt="Image preview"
          className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
        />
      </button>
    </div>
  );
}