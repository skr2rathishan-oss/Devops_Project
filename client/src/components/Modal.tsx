import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import './ui.css';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

// A native <dialog> opened as a modal while mounted; Escape and the close button call onClose.
export default function Modal({ title, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="modal__header">
        <h2 id={titleId}>{title}</h2>
        <button type="button" className="modal__close" aria-label="Close" onClick={onClose}>
          ✕
        </button>
      </div>
      {children}
    </dialog>
  );
}
