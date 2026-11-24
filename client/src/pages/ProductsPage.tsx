import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchProducts, fetchTypes, setFilter } from '../store/productsSlice';
import { fetchOrders } from '../store/ordersSlice';
import { dateNumeric, dateNamed, money } from '../utils/format';
import { TrashIcon } from '../components/Icons';
import ConfirmModal from '../components/ConfirmModal';
import ProductForm from '../components/ProductForm';
import { socket } from '../socket';
import * as apiClient from '../api';
import type { Product, ProductInput } from '../types';

const PAGE = 24; // lazy-load chunk size

export default function ProductsPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items, types, filterType } = useAppSelector((s) => s.products);
  const orders = useAppSelector((s) => s.orders.items);
  const search = useAppSelector((s) => s.ui.search);

  const [limit, setLimit] = useState(PAGE);
  const [form, setForm] = useState<{ product: Product | null } | null>(null);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const sentinel = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    dispatch(fetchTypes());
    if (orders.length === 0) dispatch(fetchOrders());
  }, [dispatch, orders.length]);

  useEffect(() => { dispatch(fetchProducts(filterType)); }, [dispatch, filterType]);

  // Live updates from other tabs/users (EDA)
  useEffect(() => {
    const onChanged = () => dispatch(fetchProducts(filterType));
    socket.on('products:changed', onChanged);
    return () => { socket.off('products:changed', onChanged); };
  }, [dispatch, filterType]);

  const q = search.trim().toLowerCase();
  const visible = q
    ? items.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        String(p.serialNumber).includes(q) ||
        p.type.toLowerCase().includes(q) ||
        (p.orderTitle || '').toLowerCase().includes(q))
    : items;

  // Reset the lazy window whenever the dataset changes (filter / search / data)
  useEffect(() => { setLimit(PAGE); }, [filterType, q, items.length]);

  const shown = visible.slice(0, limit);
  const hasMore = limit < visible.length;

  // Lazy loading: grow the window when the sentinel scrolls into view
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setLimit((l) => Math.min(l + PAGE, visible.length));
      }
    }, { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, visible.length]);

  const saveProduct = async (data: ProductInput) => {
    if (form?.product) await apiClient.updateProduct(form.product.id, data);
    else await apiClient.createProduct(data);
    dispatch(fetchProducts(filterType));
    dispatch(fetchTypes());
    setForm(null);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await apiClient.deleteProduct(toDelete.id);
      dispatch(fetchProducts(filterType));
      dispatch(fetchTypes());
    } catch {
      alert(t('orders.needLogin'));
    }
    setToDelete(null);
  };

  return (
    <div className="products">
      <div className="products__head">
        <h1 className="page-title">{t('products.title')} <span className="count-badge">{visible.length}</span></h1>
        <div className="products__tools">
          <label className="products__filter">
            {t('products.type')}:
            <select value={filterType} onChange={(e) => dispatch(setFilter(e.target.value))}>
              <option value="">{t('products.all')}</option>
              {types.map((ty) => <option key={ty} value={ty}>{ty}</option>)}
            </select>
          </label>
          <button className="btn btn-primary" onClick={() => setForm({ product: null })}>
            ＋ {t('form.newProduct')}
          </button>
        </div>
      </div>

      <div className="products__grid">
        {shown.map((p) => {
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
                <button className="pcard__edit" onClick={() => setForm({ product: p })}
                  aria-label="edit" title={t('form.editProduct')}>✎</button>
                <button className="pcard__del" onClick={() => setToDelete(p)}
                  aria-label="delete" title={t('form.deleteProduct')}><TrashIcon /></button>
              </div>

              <div className="pcard__grid">
                <div className="field">
                  <span className="field__label">{t('products.type')}</span>
                  <span className="field__val">{p.type}</span>
                </div>
                <div className="field">
                  <span className="field__label">{t('products.condition')}</span>
                  <span className="field__val">{p.isNew ? t('status.new') : t('status.used')}</span>
                </div>
                <div className="field">
                  <span className="field__label">{t('products.guarantee')}</span>
                  <span className="field__val">{dateNumeric(p.guarantee.start)} — {dateNumeric(p.guarantee.end)}</span>
                </div>
                <div className="field">
                  <span className="field__label">{t('products.order')}</span>
                  <span className="field__val field__val--accent">{p.orderTitle}</span>
                </div>
                <div className="field">
                  <span className="field__label">{t('products.price')}</span>
                  <span className="field__val">
                    <span className="muted">{money(usd)}</span> <b>{money(uah)}</b>
                  </span>
                </div>
                <div className="field">
                  <span className="field__label">{t('products.added')}</span>
                  <span className="field__val">{dateNamed(p.date)}</span>
                </div>
              </div>
            </article>
          );
        })}
        {visible.length === 0 && <div className="empty">{t('common.nothingFound')}</div>}
      </div>

      {hasMore && (
        <div className="products__more" ref={sentinel}>
          <button className="btn btn-light" onClick={() => setLimit((l) => Math.min(l + PAGE, visible.length))}>
            {t('products.loadMore')} ({visible.length - shown.length})
          </button>
        </div>
      )}

      <ConfirmModal
        open={toDelete !== null}
        text={t('form.deleteProductConfirm')}
        itemLabel={toDelete?.title}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />

      {form && (
        <ProductForm
          product={form.product}
          orders={orders}
          types={types}
          onCancel={() => setForm(null)}
          onSubmit={saveProduct}
        />
      )}
    </div>
  );
}
