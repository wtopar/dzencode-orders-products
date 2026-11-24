import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/authSlice';
import { setSearch } from '../store/uiSlice';

const WEEKDAYS_SHORT_RU = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
const WEEKDAYS_SHORT_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS_RU = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  );
}

export default function TopMenu({ onToggleMenu }: { onToggleMenu: () => void }) {
  const { t, i18n } = useTranslation();
  const [now, setNow] = useState(new Date());
  const sessions = useAppSelector((s) => s.sessions.count);
  const user = useAppSelector((s) => s.auth.user);
  const search = useAppSelector((s) => s.ui.search);
  const dispatch = useAppDispatch();

  const en = (i18n.language || 'ru').startsWith('en');
  const weekdaysShort = en ? WEEKDAYS_SHORT_EN : WEEKDAYS_SHORT_RU;
  const months = en ? MONTHS_EN : MONTHS_RU;

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="topmenu">
      <button className="topmenu__burger" onClick={onToggleMenu} aria-label="menu">☰</button>
      <div className="topmenu__logo">
        <span className="topmenu__logo-badge">▲</span>
        <span className="topmenu__logo-text">INVENTORY</span>
      </div>
      <input
        className="topmenu__search" placeholder={t('common.search')}
        value={search} onChange={(e) => dispatch(setSearch(e.target.value))}
      />

      <div className="topmenu__right">
        <div className="topmenu__sessions" title="Активных вкладок">
          <span className="topmenu__dot" /> {sessions}
        </div>

        <div className="topmenu__datetime">
          <div className="cal" aria-hidden="true">
            <div className="cal__m">{months[now.getMonth()]}</div>
            <div className="cal__d">{pad(now.getDate())}</div>
            <div className="cal__w">{weekdaysShort[now.getDay()]}</div>
          </div>
          <div className="topmenu__dt-text">
            <div className="topmenu__time">
              <ClockIcon />
              <span>{pad(now.getHours())}:{pad(now.getMinutes())}<span className="topmenu__secs">:{pad(now.getSeconds())}</span></span>
            </div>
          </div>
        </div>

        <div className="topmenu__user">
          <span className="topmenu__user-icon">👤</span>
          <span className="topmenu__user-name">{user}</span>
          <button className="topmenu__logout" title="Выйти" aria-label="Выйти"
            onClick={() => dispatch(logout())}>
            <LogoutIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
