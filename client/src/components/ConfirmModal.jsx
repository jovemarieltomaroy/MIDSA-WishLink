import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  busy = false,
  onConfirm,
  onCancel
}) {
  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={onCancel}
    >
      <div
        className="confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="modal-close"
          type="button"
          onClick={onCancel}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div
          className={`confirm-modal-icon confirm-modal-icon-${tone}`}
        >
          <AlertTriangle size={22} />
        </div>

        <h2 id="confirm-modal-title">
          {title}
        </h2>

        <p>{message}</p>

        <div className="confirm-modal-actions">
          <button
            className="ghost-button"
            type="button"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>

          <button
            className={
              tone === 'danger'
                ? 'danger-button'
                : tone === 'success'
                  ? 'success-button'
                  : 'primary-button'
            }
            type="button"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy
              ? 'Please wait…'
              : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}