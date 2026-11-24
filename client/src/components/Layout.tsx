import { useState, useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { clearSearch } from '../store/uiSlice';
import Sidebar from './Sidebar';
import TopMenu from './TopMenu';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile drawer and reset search on navigation
  useEffect(() => {
    setMenuOpen(false);
    dispatch(clearSearch());
  }, [location.pathname, dispatch]);

  return (
    <div className="layout">
      <Sidebar open={menuOpen} />
      {menuOpen && <div className="layout__overlay" onClick={() => setMenuOpen(false)} />}
      <div className="layout__main">
        <TopMenu onToggleMenu={() => setMenuOpen((v) => !v)} />
        {/* Animated route transition: re-key on path change */}
        <main className="layout__content">
          <div key={location.pathname} className="route-fade">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
