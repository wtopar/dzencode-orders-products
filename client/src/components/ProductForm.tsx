import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import type { Order, Product, ProductInput } from '../types';
import { toDateInput } from '../utils/format';

interface Props {
  product: Product | null;    // null => create
  presetOrderId?: number;     // default order when creating from an order panel
  orders: Order[];
  types: string[];
  onCancel: () => void;
  onSubmit: (data: ProductInput) => Promise<void>;
}

const usdOf = (p: Product | null) =>
  p ? String(p.price.find((x) => x.symbol === 'USD')?.value ?? '') : '';

export default function ProductForm({ product, presetOrderId, orders, types, onCancel, onSubmit }: Props) {
  const { t } = useTranslation();

  const [serial, setSerial] = useState(product ? String(product.serialNumber) : '');
  const [title, setTitle] = useState(product?.title ?? '');
  const [type, setType] = useState(product?.type ?? '');
  const [isNew, setIsNew] = useState(product ? Boolean(product.isNew) : true);
  const [spec, setSpec] = useState(product?.specification ?? '');
  const [gStart, setGStart] = useState(toDateInput(product?.guarantee.start));
  const [gEnd, setGEnd] = useState(toDateInput(product?.guarantee.end));
  const [orderId, setOrderId] = useState<number>(product?.order ?? presetOrderId ?? orders[0]?.id ?? 0);
  const [priceUsd, setPriceUsd] = useState(usdOf(product));

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const validate = (): boolean => {
    const e: Record<string, boolean> = {};
    if (!title.trim()) e.title = true;
    if (serial.trim() === '' || Number.isNaN(Number(serial))) e.serial = true;
    if (!type.trim()) e.type = true;
    if (!orderId) e.order = true;
    if (priceUsd.trim() === '' || Number(priceUsd) < 0) e.price = true;
    if (gStart && gEnd && new Date(gEnd) < new Date(gStart)) e.gEnd = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) { setFormError(t('form.fixFields')); return; }
    setSaving(true);
    setFormError('');
    try {
      await onSubmit({
        serialNumber: Number(serial),
        title: title.trim(),
        type: type.trim(),
        isNew: isNew ? 1 : 0,
        specification: spec.trim(),
        guarantee: { start: gStart, end: gEnd },
        order: orderId,
        priceUsd: Number(priceUsd) || 0,
      });
    } catch (err) {
      setSaving(false);
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      setFormError(status === 401 ? t('orders.needLogin') : t('form.saveError'));
    }
  };

  const cls = (k: string) => 'form-input' + (errors[k] ? ' form-input--error' : '');

  return (
    <div className="modal-backdrop-custom" onClick={onCancel}>
      <form className="form-modal form-modal--wide" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3 className="form-modal__title">{product ? t('form.editProduct') : t('form.newProduct')}</h3>

        <div className="form-grid">
          <label className="form-field form-field--full">
            <span className="form-field__label">{t('form.productTitle')} *</span>
            <input className={cls('title')} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </label>

          <label className="form-field">
            <span className="form-field__label">{t('form.serial')} *</span>
            <input className={cls('serial')} inputMode="numeric" value={serial} onChange={(e) => setSerial(e.target.value)} />
          </label>

          <label className="form-field">
            <span className="form-field__label">{t('form.type')} *</span>
            <input className={cls('type')} list="product-type-list" value={type} onChange={(e) => setType(e.target.value)} />
            <datalist id="product-type-list">
              {types.map((ty) => <option key={ty} value={ty} />)}
            </datalist>
          </label>

          <label className="form-field">
            <span className="form-field__label">{t('form.order')} *</span>
            <select className={cls('order')} value={orderId} onChange={(e) => setOrderId(Number(e.target.value))}>
              {orders.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
            </select>
          </label>

          <label className="form-field">
            <span className="form-field__label">{t('form.priceUsd')} *</span>
            <input className={cls('price')} inputMode="decimal" value={priceUsd} onChange={(e) => setPriceUsd(e.target.value)} />
          </label>

          <label className="form-field">
            <span className="form-field__label">{t('form.guaranteeStart')}</span>
            <input className="form-input" type="date" value={gStart} onChange={(e) => setGStart(e.target.value)} />
          </label>

          <label className="form-field">
            <span className="form-field__label">{t('form.guaranteeEnd')}</span>
            <input className={cls('gEnd')} type="date" value={gEnd} onChange={(e) => setGEnd(e.target.value)} />
          </label>

          <label className="form-field form-field--full">
            <span className="form-field__label">{t('form.spec')}</span>
            <input className="form-input" value={spec} onChange={(e) => setSpec(e.target.value)} />
          </label>

          <label className="form-check form-field--full">
            <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
            <span>{t('form.isNew')}</span>
          </label>
        </div>

        {formError && <div className="form-error">{formError}</div>}

        <div className="form-actions">
          <button type="button" className="btn btn-light" onClick={onCancel}>{t('form.cancel')}</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? t('form.saving') : t('form.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
