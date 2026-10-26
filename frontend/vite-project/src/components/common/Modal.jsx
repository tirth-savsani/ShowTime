import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md', // max-w-md (480px) or max-w-2xl (720px)
  blocking = false,
  showCloseButton = true,
  className = '',
}) => {
  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !blocking && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, blocking, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop overlay rgba(0,0,0,0.6) */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          if (!blocking && onClose) onClose();
        }}
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative z-10 w-full ${maxWidth} bg-card rounded-lg shadow-modal border border-border p-6 overflow-hidden animate-in zoom-in-95 duration-200 ${className}`}
      >
        {/* Modal Header */}
        {(title || (!blocking && showCloseButton)) && (
          <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
            {title && (
              <h3 className="text-lg font-bold text-ink tracking-tight">
                {title}
              </h3>
            )}
            {!blocking && showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="text-muted hover:text-ink p-1 rounded-xs transition-colors ml-auto focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Modal Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
