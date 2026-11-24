import { useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { login, clearError } from '../store/authSlice';

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const error = useAppSelector((s) => s.auth.error);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await dispatch(login({ username, password }));
    if (login.fulfilled.match(res)) onClose();
  };

  const close = () => { dispatch(clearError()); onClose(); };

  return (
    <div className="modal-backdrop-custom" onClick={close}>
      <form className="confirm-modal login-modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3 className="login-modal__title">Вход</h3>
        <input
          className="login-modal__input" placeholder="Логин" required
          value={username} onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="login-modal__input" type="password" placeholder="Пароль" required minLength={3}
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="login-modal__error">{error}</div>}
        <div className="login-modal__hint">Демо-доступ: <b>admin / admin</b></div>
        <div className="confirm-modal__actions">
          <button type="button" className="btn btn-light" onClick={close}>Отмена</button>
          <button type="submit" className="btn btn-success">Войти</button>
        </div>
      </form>
    </div>
  );
}
