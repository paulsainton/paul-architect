"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className = "" }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className={`backdrop:bg-black/60 bg-bg-surface border border-border rounded-2xl p-0 max-w-3xl w-full max-h-[90vh] overflow-hidden ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-bg-card text-text-muted">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="overflow-y-auto p-5">{children}</div>
    </dialog>
  );
}
