import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchProducts, fetchTypes, setFilter } from '../store/productsSlice';
import { dateNumeric, dateNamed, money } from '../utils/format';
import { TrashIcon } from '../components/Icons';

export default function ProductsPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items, types, filterType } = useAppSelector((s) => s.products);

  useEffect(() => { dispatch(fetchTypes()); }, [dispatch]);
  useEffect(() => { dispatch(fetchProducts(filterType)); }, [dispatch, filterType]);

  return (
    <div className="products">
      <div className="products__head">
        <h1 className="page-title">{t('products.title')} <span className="count-badge">{items.length}</span></h1>
        <label className="products__filter">
          {t('products.type')}:
          <select value={filterType} onChange={(e) => dispatch(setFilter(e.target.value))}>
            <option value="">{t('products.all')}</option>
            {types.map((ty) => <option key={ty} value={ty}>{ty}</option>)}
          </select>
        </label>
      </div>

      <div className="products__grid">
        {items.map((p) => {
          const usd = p.price.find((x) => x.symbol === 'USD');
          const uah = p.price.find((x) => x.symbol === 'UAH');
          return (
            <article key={p.id} className="pcard">
              <div className="pcard__head">
                <span className="pcard__thumb">
                  <img src={p.photo} alt={p.type}
                    onError={(e) => { e.currentTarget.src = '/img/products/default.svg'; }} />
                </span>
                <div className="pcard__titlewrap">
                  <div className="pcard__title">{p.title}</div>
                  <div className="pcard__sn">SN-{p.serialNumber}</div>
                </div>
                <span className={'pill ' + (p.isNew ? 'pill--ok' : 'pill--warn')}>
                  {p.isNew ? t('status.free') : t('status.repair')}
                </span>
                <button className="pcard__del" aria-label="delete" title="Удалить"><TrashIcon /></button>
              </div>

              <div className="pcard__grid">
                <div className="field">
                  <span className="field__label">{t('products.type')}</span>
                  <span className="field__val">{p.type}</span>
                </div>
                <div className="field">
                  <span className="field__label">Состояние</span>
                  <span className="field__val">{p.isNew ? t('status.new') : t('status.used')}</span>
                </div>
                <div className="field">
                  <span className="field__label">Гарантия</span>
                  <span className="field__val">{dateNumeric(p.guarantee.start)} — {dateNumeric(p.guarantee.end)}</span>
                </div>
                <div className="field">
                  <span className="field__label">Приход</span>
                  <span className="field__val field__val--accent">{p.orderTitle}</span>
                </div>
                <div className="field">
                  <span className="field__label">Цена</span>
                  <span className="field__val">
                    <span className="muted">{money(usd)}</span> <b>{money(uah)}</b>
                  </span>
                </div>
                <div className="field">
                  <span className="field__label">Добавлен</span>
                  <span className="field__val">{dateNamed(p.date)}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
