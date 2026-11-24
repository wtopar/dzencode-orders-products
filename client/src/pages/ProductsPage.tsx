import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchProducts, fetchTypes, setFilter } from '../store/productsSlice';
import { dateNumeric, dateNamed, defaultPrice, otherPrice, money } from '../utils/format';
import { TrashIcon, MonitorIcon } from '../components/Icons';

export default function ProductsPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items, types, filterType } = useAppSelector((s) => s.products);

  useEffect(() => { dispatch(fetchTypes()); }, [dispatch]);
  useEffect(() => { dispatch(fetchProducts(filterType)); }, [dispatch, filterType]);

  return (
    <div className="products">
      <div className="products__head">
        <h1 className="page-title">{t('products.title')} / {items.length}</h1>
        <label className="products__filter">
          {t('products.type')}:
          <select
            value={filterType}
            onChange={(e) => dispatch(setFilter(e.target.value))}
          >
            <option value="">{t('products.all')}</option>
            {types.map((ty) => <option key={ty} value={ty}>{ty}</option>)}
          </select>
        </label>
      </div>

      <div className="products__list">
        {items.map((p) => (
          <div key={p.id} className="product-row">
            <span className="product-row__status" />
            <span className="product-row__img"><MonitorIcon /></span>
            <span className="product-row__title">
              {p.title}<br /><small className="muted">SN-{p.serialNumber}</small>
            </span>
            <span className={'product-row__state ' + (p.isNew ? 'is-new' : 'is-used')}>
              {p.isNew ? t('status.free') : t('status.repair')}
            </span>
            <span className="product-row__guarantee">
              <div><small className="muted">с</small> {dateNumeric(p.guarantee.start)}</div>
              <div><small className="muted">по</small> {dateNumeric(p.guarantee.end)}</div>
            </span>
            <span className="product-row__cond">{p.isNew ? t('status.new') : t('status.used')}</span>
            <span className="product-row__price">
              <div className="muted">{money(defaultPrice(p.price)?.symbol === 'USD' ? defaultPrice(p.price) : otherPrice(p.price))}</div>
              <b>{money(defaultPrice(p.price)?.symbol === 'USD' ? otherPrice(p.price) : defaultPrice(p.price))}</b>
            </span>
            <span className="product-row__order">{p.orderTitle}</span>
            <span className="product-row__date muted">{dateNamed(p.date)}</span>
            <button className="product-row__del" aria-label="delete" title="Удалить"><TrashIcon /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
