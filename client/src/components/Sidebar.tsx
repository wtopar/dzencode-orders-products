import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Sidebar() {
  const { t } = useTranslation();
  const link = ({ isActive }: { isActive: boolean }) =>
    'sidebar__link' + (isActive ? ' sidebar__link--active' : '');

  return (
    <aside className="sidebar">
      <div className="sidebar__profile">
        <div className="sidebar__avatar" />
        <button className="sidebar__gear" aria-label="settings">⚙</button>
      </div>
      <nav className="sidebar__nav">
        <NavLink to="/orders" className={link}>{t('nav.orders')}</NavLink>
        <NavLink to="/dashboard" className={link}>{t('nav.dashboard')}</NavLink>
        <NavLink to="/products" className={link}>{t('nav.products')}</NavLink>
        <span className="sidebar__link sidebar__link--disabled">{t('nav.users')}</span>
        <span className="sidebar__link sidebar__link--disabled">{t('nav.settings')}</span>
      </nav>
    </aside>
  );
}
