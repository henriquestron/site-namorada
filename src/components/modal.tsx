"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./icon";

export function Modal({ open, onClose, titleId, children, className = "" }: {
  open: boolean;
  onClose: () => void;
  titleId: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    const previousOverflow = document.documentElement.style.overflow;
    dialog.showModal();
    document.documentElement.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog ref={ref} className={`modal ${className}`} aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="modal-body">
        <button type="button" className="icon-button modal-close" aria-label="Fechar" onClick={onClose}><Icon name="close" /></button>
        {children}
      </div>
    </dialog>
  );
}
