import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopMenu from './TopMenu';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout__main">
        <TopMenu />
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
