import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../store';
import { getUsers } from '../api';
import { dateNamed } from '../utils/format';
import type { User } from '../types';

const AVATAR_COLORS = ['#86b817', '#4a90d9', '#e8a33d', '#6f42c1', '#20c997', '#d9534f'];

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function UsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const search = useAppSelector((s) => s.ui.search);
  const [role, setRole] = useState('');

  useEffect(() => { getUsers().then(setUsers); }, []);

  const roles = useMemo(() => [...new Set(users.map((u) => u.role))], [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) =>
      (!role || u.role === role) &&
      (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
  }, [users, search, role]);

  return (
    <div className="users">
      <div className="users__head">
        <h1 className="page-title">{t('users.title')} <span className="count-badge">{filtered.length}</span></h1>
        <div className="filterbar">
          <select className="filterbar__select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">{t('users.allRoles')}</option>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="users__grid">
        {filtered.map((u, i) => (
          <article key={u.id} className="ucard">
            <div className="ucard__avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
              {initials(u.name)}
            </div>
            <div className="ucard__body">
              <div className="ucard__name">{u.name}</div>
              <div className="ucard__email">{u.email}</div>
              <div className="ucard__meta">
                <span className="ucard__role">{u.role}</span>
                <span className={'pill ' + (u.status === 'active' ? 'pill--ok' : 'pill--warn')}>
                  {u.status === 'active' ? t('status.active') : t('status.blocked')}
                </span>
              </div>
              <div className="ucard__since">{t('users.since')} {dateNamed(u.created)}</div>
            </div>
          </article>
        ))}
        {filtered.length === 0 && <div className="empty">{t('users.empty')}</div>}
      </div>
    </div>
  );
}
