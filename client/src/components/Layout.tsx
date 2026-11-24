import { useState, useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopMenu from './TopMenu';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile drawer on navigation
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

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
