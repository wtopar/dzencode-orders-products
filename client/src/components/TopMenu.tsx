import { useEffect, useState } from 'react';
import { useAppSelector } from '../store';

const WEEKDAYS = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
const pad = (n: number) => String(n).padStart(2, '0');

export default function TopMenu({ onToggleMenu }: { onToggleMenu: () => void }) {
  const [now, setNow] = useState(new Date());
  const sessions = useAppSelector((s) => s.sessions.count);

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
        <div className="topmenu__clock">
          <div className="topmenu__weekday">{WEEKDAYS[now.getDay()]}</div>
          <div className="topmenu__date">
            {pad(now.getDate())} {MONTHS[now.getMonth()]}, {now.getFullYear()}
            <span className="topmenu__time">
              {' '}⏱ {pad(now.getHours())}:{pad(now.getMinutes())}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
