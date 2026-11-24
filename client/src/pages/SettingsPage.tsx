import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/authSlice';

function useStoredToggle(key: string, def: boolean): [boolean, () => void] {
  const [on, setOn] = useState<boolean>(() => {
    const v = localStorage.getItem(key);
    return v === null ? def : v === '1';
  });
  const toggle = () => setOn((prev) => {
    const next = !prev;
    localStorage.setItem(key, next ? '1' : '0');
    return next;
  });
  return [on, toggle];
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user) || 'admin';
  const [lang, setLang] = useState(i18n.language);

  const [notify, toggleNotify] = useStoredToggle('pref.notify', true);
  const [compact, toggleCompact] = useStoredToggle('pref.compact', false);
  const [hints, toggleHints] = useStoredToggle('pref.hints', true);
  const [saved, setSaved] = useState('');

  const changeLang = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lang', lng);
    setLang(lng);
  };

  const resetFilters = () => {
    localStorage.removeItem('productFilter');
    setSaved(t('settings.cleared'));
    setTimeout(() => setSaved(''), 2500);
  };

  return (
    <div className="settings">
      <h1 className="page-title">{t('settings.title')}</h1>

      <section className="scard">
        <h3 className="scard__title">{t('settings.profile')}</h3>
        <div className="scard__profile">
          <div className="ucard__avatar" style={{ background: '#86b817' }}>{initials(user)}</div>
          <div>
            <div className="ucard__name">{user}</div>
            <div className="ucard__email">admin@dzencode.test · Администратор</div>
          </div>
          <button className="btn-outline btn-outline--danger" onClick={() => dispatch(logout())}>{t('settings.logout')}</button>
        </div>
      </section>

      <section className="scard">
        <h3 className="scard__title">{t('settings.language')}</h3>
        <div className="segmented">
          <button className={'segmented__btn' + (lang.startsWith('ru') ? ' is-active' : '')} onClick={() => changeLang('ru')}>Русский</button>
          <button className={'segmented__btn' + (lang.startsWith('en') ? ' is-active' : '')} onClick={() => changeLang('en')}>English</button>
        </div>
      </section>

      <section className="scard">
        <h3 className="scard__title">{t('settings.prefs')}</h3>
        <Row label={t('settings.notify')} on={notify} onToggle={toggleNotify} />
        <Row label={t('settings.compact')} on={compact} onToggle={toggleCompact} />
        <Row label={t('settings.hints')} on={hints} onToggle={toggleHints} />
      </section>

      <section className="scard">
        <h3 className="scard__title">{t('settings.data')}</h3>
        <div className="scard__row">
          <span>{t('settings.resetFilter')}</span>
          <button className="btn-outline" onClick={resetFilters}>{t('settings.reset')}</button>
        </div>
        {saved && <div className="scard__saved">{saved}</div>}
      </section>
    </div>
  );
}

function Row({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="scard__row">
      <span>{label}</span>
      <button className={'switch' + (on ? ' switch--on' : '')} onClick={onToggle} role="switch" aria-checked={on}>
        <span className="switch__knob" />
      </button>
    </div>
  );
}
