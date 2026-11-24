import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import type { Order, OrderInput } from '../types';

interface Props {
  order: Order | null; // null => create
  onCancel: () => void;
  onSubmit: (data: OrderInput) => Promise<void>;
}

export default function OrderForm({ order, onCancel, onSubmit }: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(order?.title ?? '');
  const [description, setDescription] = useState(order?.description ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError(t('form.required')); return; }
    setSaving(true);
    setError('');
    try {
      await onSubmit({ title: title.trim(), description: description.trim() });
    } catch (err) {
      setSaving(false);
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      setError(status === 401 ? t('orders.needLogin') : t('form.saveError'));
    }
  };

  return (
    <div className="modal-backdrop-custom" onClick={onCancel}>
      <form className="form-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3 className="form-modal__title">{order ? t('form.editOrder') : t('form.newOrder')}</h3>

        <label className="form-field">
          <span className="form-field__label">{t('form.title')} *</span>
          <input
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </label>

        <label className="form-field">
          <span className="form-field__label">{t('form.description')}</span>
          <textarea
            className="form-input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <button type="button" className="btn btn-light" onClick={onCancel}>
            {t('form.cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? t('form.saving') : t('form.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
