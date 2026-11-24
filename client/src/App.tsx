import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { socket } from './socket';
import { useAppDispatch } from './store';
import { setSessions } from './store/sessionsSlice';
import { fetchOrders } from './store/ordersSlice';
import Layout from './components/Layout';

// Lazy Loading marker: route-level code splitting
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

export default function App() {
  const dispatch = useAppDispatch();

  // Event-Driven: react to live socket events
  useEffect(() => {
    const onSessions = (n: number) => dispatch(setSessions(n));
    const onOrdersChanged = () => dispatch(fetchOrders());
    socket.on('sessions', onSessions);
    socket.on('orders:changed', onOrdersChanged);
    return () => {
      socket.off('sessions', onSessions);
      socket.off('orders:changed', onOrdersChanged);
    };
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<div className="page-loader">Загрузка…</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/orders" replace />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<Navigate to="/orders" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}
