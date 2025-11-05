import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function BaseModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "max-w-lg",
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40"
        >
          <motion.div
            key="modalContent"
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`relative bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl w-full ${width} p-6`}
          >
            {/* Tombol Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-[#622F10] hover:bg-[#622F10]/10 p-2 rounded-full transition"
            >
              <X size={20} />
            </button>

            {/* Header */}
            {(title || subtitle) && (
              <div className="text-center mb-6">
                {title && (
                  <h2 className="text-2xl font-semibold text-[#622F10]">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-600">{subtitle}</p>
                )}
              </div>
            )}

            {/* Konten */}
            <div>{children}</div>

            {/* Footer */}
            {footer && <div className="mt-6">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
