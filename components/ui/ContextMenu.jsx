import { motion, AnimatePresence } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";

export default function ContextMenu({
  menu,
  onClose,
  onEdit,
  onDelete,
  editLabel = "Edit",
  deleteLabel = "Delete",
}) {
  return (
    <AnimatePresence>
      {menu && (
        <>
          <button
            className="fixed inset-0 z-[9998] cursor-default"
            onClick={onClose}
            onContextMenu={(e) => {
              e.preventDefault();
              onClose();
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.12 }}
            style={{
              top: menu.y,
              left: menu.x,
            }}
            className="fixed z-[9999] w-48 rounded-xl border border-white/10 bg-[#111827] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
          >
            <button
              onClick={onEdit}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              {editLabel}
              <Edit size={15} />
            </button>

            <div className="my-1 h-px bg-white/10" />

            <button
              onClick={onDelete}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
            >
              {deleteLabel}
              <Trash2 size={15} />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}