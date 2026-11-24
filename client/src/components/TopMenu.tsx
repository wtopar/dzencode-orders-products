import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/authSlice';

const WEEKDAYS = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
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

export default function TopMenu({ onToggleMenu }: { onToggleMenu: () => void }) {
  const [now, setNow] = useState(new Date());
  const sessions = useAppSelector((s) => s.sessions.count);
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="topmenu">
      <button className="topmenu__burger" onClick={onToggleMenu} aria-label="menu">☰</button>
      <div className="topmenu__logo">
        <span className="topmenu__logo-badge">▲</span> INVENTORY
      </div>
      <input className="topmenu__search" placeholder="Поиск" />

      <div className="topmenu__right">
        <div className="topmenu__sessions" title="Активных вкладок">
          <span className="topmenu__dot" /> {sessions}
        </div>

        <div className="topmenu__datetime">
          <div className="cal" aria-hidden="true">
            <div className="cal__m">{MONTHS[now.getMonth()]}</div>
            <div className="cal__d">{pad(now.getDate())}</div>
          </div>
          <div className="topmenu__dt-text">
            <div className="topmenu__weekday">{WEEKDAYS[now.getDay()]}</div>
            <div className="topmenu__time">{pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}</div>
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
