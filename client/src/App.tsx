import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { socket } from './socket';
import { useAppDispatch, useAppSelector } from './store';
import { setSessions } from './store/sessionsSlice';
import { fetchOrders } from './store/ordersSlice';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';

// Lazy Loading marker: route-level code splitting
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function ProtectedLayout() {
  return (
    <Layout>
      <Suspense fallback={<div className="page-loader">Загрузка…</div>}>
        <Outlet />
      </Suspense>
    </Layout>
  );
}

export default function App() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

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
      <Routes>
        {/* Public: login screen (redirect in if already authenticated) */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

        {/* Protected: the whole app requires authentication */}
        {user ? (
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}
