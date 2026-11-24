import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchOrders, fetchOrderProducts, selectOrder, removeOrder } from '../store/ordersSlice';
import { fetchTypes } from '../store/productsSlice';
import { dateNumeric, dateNamed, money } from '../utils/format';
import DeleteModal from '../components/DeleteModal';
import ConfirmModal from '../components/ConfirmModal';
import OrderForm from '../components/OrderForm';
import ProductForm from '../components/ProductForm';
import { BoxIcon, TrashIcon, MonitorIcon } from '../components/Icons';
import * as apiClient from '../api';
import type { Order, OrderInput, Product, ProductInput } from '../types';

type OrderFormState = { order: Order | null } | null;
type ProductFormState = { product: Product | null; presetOrderId?: number } | null;

export default function OrdersPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items, selectedId, selectedProducts } = useAppSelector((s) => s.orders);
  const types = useAppSelector((s) => s.products.types);
  const search = useAppSelector((s) => s.ui.search);

  const [toDelete, setToDelete] = useState<Order | null>(null);
  const [orderForm, setOrderForm] = useState<OrderFormState>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => { dispatch(fetchOrders()); dispatch(fetchTypes()); }, [dispatch]);

  const q = search.trim().toLowerCase();
  const visible = q ? items.filter((o) => o.title.toLowerCase().includes(q)) : items;

  const open = (id: number) => {
    if (selectedId === id) { dispatch(selectOrder(null)); return; }
    dispatch(selectOrder(id));
    dispatch(fetchOrderProducts(id));
  };

  const selected = items.find((o) => o.id === selectedId) || null;

  const refreshOrder = () => {
    dispatch(fetchOrders());
    if (selectedId) dispatch(fetchOrderProducts(selectedId));
  };

  const saveOrder = async (data: OrderInput) => {
    if (orderForm?.order) await apiClient.updateOrder(orderForm.order.id, data);
    else await apiClient.createOrder(data);
    dispatch(fetchOrders());
    setOrderForm(null);
  };

  const saveProduct = async (data: ProductInput) => {
    if (productForm?.product) await apiClient.updateProduct(productForm.product.id, data);
    else await apiClient.createProduct(data);
    refreshOrder();
    dispatch(fetchTypes());
    setProductForm(null);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await apiClient.deleteProduct(productToDelete.id);
      refreshOrder();
    } catch {
      alert(t('orders.needLogin'));
    }
    setProductToDelete(null);
  };

  return (
    <div className={'orders' + (selected ? ' orders--split' : '')}>
      <div className="orders__list">
        <h1 className="page-title">
          <button className="page-title__add" onClick={() => setOrderForm({ order: null })} title={t('form.newOrder')}>＋</button>
          {t('orders.title')} <span className="count-badge">{visible.length}</span>
        </h1>

        {visible.map((o) => {
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
                  className="order-row__edit"
                  onClick={(e) => { e.stopPropagation(); setOrderForm({ order: o }); }}
                  aria-label="edit" title={t('form.editOrder')}
                >✎</button>
                <button
                  className="order-row__del"
                  onClick={(e) => { e.stopPropagation(); setToDelete(o); }}
                  aria-label="delete" title={t('form.deleteOrder')}
                ><TrashIcon /></button>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="orders__detail">
          <button className="orders__close" onClick={() => dispatch(selectOrder(null))}>✕</button>
          <h2 className="orders__detail-title">
            {selected.title}
            <button className="orders__edit" onClick={() => setOrderForm({ order: selected })} title={t('form.editOrder')}>✎</button>
          </h2>
          <button
            className="orders__add-product"
            onClick={() => setProductForm({ product: null, presetOrderId: selected.id })}
          >＋ {t('orders.add')}</button>
          <div className="orders__products">
            {selectedProducts.map((p) => (
              <div
                key={p.id}
                className="product-mini product-mini--clickable"
                onClick={() => setProductForm({ product: p, presetOrderId: p.order })}
                title={t('form.editProduct')}
              >
                <span className="product-mini__status" />
                <span className="product-mini__img"><MonitorIcon /></span>
                <span className="product-mini__title">
                  {p.title}<br /><small className="muted">SN-{p.serialNumber}</small>
                </span>
                <span className={'product-mini__state ' + (p.isNew ? 'is-new' : 'is-used')}>
                  {p.isNew ? t('status.free') : t('status.repair')}
                </span>
                <button
                  className="product-mini__del"
                  onClick={(e) => { e.stopPropagation(); setProductToDelete(p); }}
                  aria-label="delete" title={t('form.deleteProduct')}
                ><TrashIcon /></button>
              </div>
            ))}
            {selectedProducts.length === 0 && <div className="empty">{t('common.nothingFound')}</div>}
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
              alert(t('orders.needLogin'));
            }
          }
          setToDelete(null);
        }}
      />

      <ConfirmModal
        open={productToDelete !== null}
        text={t('form.deleteProductConfirm')}
        itemLabel={productToDelete?.title}
        onCancel={() => setProductToDelete(null)}
        onConfirm={confirmDeleteProduct}
      />

      {orderForm && (
        <OrderForm order={orderForm.order} onCancel={() => setOrderForm(null)} onSubmit={saveOrder} />
      )}

      {productForm && (
        <ProductForm
          product={productForm.product}
          presetOrderId={productForm.presetOrderId}
          orders={items}
          types={types}
          onCancel={() => setProductForm(null)}
          onSubmit={saveProduct}
        />
      )}
    </div>
  );
}
