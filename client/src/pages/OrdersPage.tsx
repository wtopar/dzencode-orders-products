import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchOrders, fetchOrderProducts, selectOrder, removeOrder } from '../store/ordersSlice';
import { dateNumeric, dateNamed, money } from '../utils/format';
import DeleteModal from '../components/DeleteModal';
import { BoxIcon, TrashIcon, MonitorIcon } from '../components/Icons';
import type { Order } from '../types';

export default function OrdersPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items, selectedId, selectedProducts } = useAppSelector((s) => s.orders);
  const [toDelete, setToDelete] = useState<Order | null>(null);

  useEffect(() => { dispatch(fetchOrders()); }, [dispatch]);

  const open = (id: number) => {
    if (selectedId === id) { dispatch(selectOrder(null)); return; }
    dispatch(selectOrder(id));
    dispatch(fetchOrderProducts(id));
  };

  const selected = items.find((o) => o.id === selectedId) || null;

  return (
    <div className={'orders' + (selected ? ' orders--split' : '')}>
      <div className="orders__list">
        <h1 className="page-title">
          <button className="page-title__add">＋</button>
          {t('orders.title')} / {items.length}
        </h1>

        {items.map((o) => {
          const usd = o.total.find((x) => x.symbol === 'USD');
          const uah = o.total.find((x) => x.symbol === 'UAH');
          const isActive = o.id === selectedId;
          const info = (
            <div className="order-row__info">
              <span className="order-row__count">
                <BoxIcon /><b>{o.productCount}</b> {t('orders.products')}
              </span>
              <span className="order-row__dates">
                <span>{dateNumeric(o.date)}</span>
                <span className="muted">{dateNamed(o.date)}</span>
              </span>
            </div>
          );
          return (
            <div
              key={o.id}
              className={'order-row' + (isActive ? ' order-row--active' : '') + (selected ? ' order-row--compact' : '')}
              onClick={() => open(o.id)}
            >
              <span className="order-row__status" />
              {selected ? info : (
                <div className="order-row__main">
                  <div className="order-row__title">{o.title}</div>
                  {info}
                </div>
              )}
              <div className="order-row__right">
                {!selected && (
                  <span className="order-row__sum">
                    <span className="muted">{money(usd ? { ...usd, isDefault: 0 } : undefined)}</span>
                    <b>{money(uah ? { ...uah, isDefault: 1 } : undefined)}</b>
                  </span>
                )}
                <button
                  className="order-row__del"
                  onClick={(e) => { e.stopPropagation(); setToDelete(o); }}
                  aria-label="delete" title="Удалить приход"
                ><TrashIcon /></button>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="orders__detail">
          <button className="orders__close" onClick={() => dispatch(selectOrder(null))}>✕</button>
          <h2 className="orders__detail-title">{selected.title}</h2>
          <button className="orders__add-product">＋ {t('orders.add')}</button>
          <div className="orders__products">
            {selectedProducts.map((p) => (
              <div key={p.id} className="product-mini">
                <span className="product-mini__status" />
                <span className="product-mini__img"><MonitorIcon /></span>
                <span className="product-mini__title">
                  {p.title}<br /><small className="muted">SN-{p.serialNumber}</small>
                </span>
                <span className={'product-mini__state ' + (p.isNew ? 'is-new' : 'is-used')}>
                  {p.isNew ? t('status.free') : t('status.repair')}
                </span>
                <button className="product-mini__del" aria-label="delete"><TrashIcon /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <DeleteModal
        order={toDelete}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) {
            try {
              await dispatch(removeOrder(toDelete.id)).unwrap();
            } catch {
              alert('Для удаления нужно войти. Демо-доступ: admin / admin.');
            }
          }
          setToDelete(null);
        }}
      />
    </div>
  );
}
