import { useTranslation } from 'react-i18next';
import type { Order } from '../types';

interface Props {
  order: Order | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({ order, onCancel, onConfirm }: Props) {
  const { t } = useTranslation();
  if (!order) return null;
  return (
    <div className="modal-backdrop-custom" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-modal__text">{t('modal.confirm')}</p>
        <div className="confirm-modal__order">
          <span className="confirm-modal__dot" /> {order.title}
        </div>
        <div className="confirm-modal__actions">
          <button className="btn btn-light" onClick={onCancel}>{t('modal.cancel')}</button>
          <button className="btn btn-danger" onClick={onConfirm}>🗑 {t('modal.delete')}</button>
        </div>
      </div>
    </div>
  );
}
