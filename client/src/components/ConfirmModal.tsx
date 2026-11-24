import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  text: string;
  itemLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

// Generic confirmation dialog (used for deleting products and other items).
export default function ConfirmModal({ open, text, itemLabel, onCancel, onConfirm }: Props) {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <div className="modal-backdrop-custom" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-modal__text">{text}</p>
        {itemLabel && (
          <div className="confirm-modal__order">
            <span className="confirm-modal__dot" /> {itemLabel}
          </div>
        )}
        <div className="confirm-modal__actions">
          <button className="btn btn-light" onClick={onCancel}>{t('modal.cancel')}</button>
          <button className="btn btn-danger" onClick={onConfirm}>🗑 {t('modal.delete')}</button>
        </div>
      </div>
    </div>
  );
}
