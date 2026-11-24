import { useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { login } from '../store/authSlice';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const error = useAppSelector((s) => s.auth.error);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await dispatch(login({ username, password }));
    setSubmitting(false);
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="login-card__logo">
          <span className="login-card__badge">▲</span> INVENTORY
        </div>
        <h1 className="login-card__title">Вход в систему</h1>

        <label className="login-card__label">Логин</label>
        <input
          className="login-card__input" placeholder="Логин" required autoFocus
          value={username} onChange={(e) => setUsername(e.target.value)}
        />

        <label className="login-card__label">Пароль</label>
        <input
          className="login-card__input" type="password" placeholder="Пароль" required minLength={3}
          value={password} onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className="login-card__error">{error}</div>}

        <button className="login-card__submit" type="submit" disabled={submitting}>
          {submitting ? 'Вход…' : 'Войти'}
        </button>

        <div className="login-card__hint">Демо-доступ: <b>admin / admin</b></div>
      </form>
    </div>
  );
}
