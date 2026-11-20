import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop: --bg-deep #121212 with opacity */}
      <div
        className="fixed inset-0 bg-bg-deep/85 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Surface: --bg-surface #232F3E */}
      <div
        className={`relative w-full ${maxWidth} bg-bg-surface text-text-primary rounded-lg border border-text-muted/20 shadow-2xl z-10 overflow-hidden transform transition-all duration-200 animate-fade-in`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-text-muted/20">
            <h3 className="text-lg font-bold text-text-primary">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-base/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-prime"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-bg-base/70 text-text-muted hover:text-text-primary hover:bg-bg-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-prime"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="max-h-[85vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
