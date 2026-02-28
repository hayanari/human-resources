import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';

export default function LoginOverlay({ content }) {
  const { doLogin } = useApp();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const errRef = useRef(null);

  const login = content?.login || {};
  const demoAccounts = login.demoAccounts || [];

  const handleLogin = () => {
    setErr('');
    if (!userId.trim() || !password) {
      setErr('IDとパスワードを入力してください');
      return;
    }
    const result = doLogin(userId.trim(), password);
    if (!result.ok) {
      setErr(result.msg || 'ログインに失敗しました');
    }
  };

  const handleQuickLogin = (id, pw) => {
    setErr('');
    const result = doLogin(id, pw);
    if (!result.ok) setErr(result.msg || 'ログインに失敗しました');
  };

  return (
    <div className="login-overlay">
      <div className="login-box">
        <div className="login-logo">
          <div className="login-mark">H</div>
          <div className="login-title">{login.title || 'HRナビ Pro'}</div>
          <div className="login-sub">{login.subtitle || 'ユーザーIDとパスワードでログイン'}</div>
        </div>
        <div className="login-fg">
          <div className="login-label">{login.userIdLabel || 'ユーザーID'}</div>
          <input
            className="login-inp"
            type="text"
            placeholder={login.userIdPlaceholder || '例: admin'}
            autoComplete="username"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && document.getElementById('li-pw')?.focus()}
          />
        </div>
        <div className="login-fg">
          <div className="login-label">{login.passwordLabel || 'パスワード'}</div>
          <input
            id="li-pw"
            className="login-inp"
            type="password"
            placeholder={login.passwordPlaceholder || 'パスワードを入力'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>
        <button className="login-btn" type="button" onClick={handleLogin}>
          {login.loginButton || 'ログイン →'}
        </button>
        {err && (
          <div ref={errRef} className="login-err show">
            {err}
          </div>
        )}
        <div className="login-demo">
          <div className="login-demo-title">{login.demoTitle || 'デモアカウント（クリックでログイン）'}</div>
          <div className="login-demo-rows">
            {demoAccounts.map((a) => (
              <div
                key={a.id}
                className="login-demo-row"
                onClick={() => handleQuickLogin(a.id, a.pw)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickLogin(a.id, a.pw)}
              >
                <div className="login-demo-id">{a.label}</div>
                <span className={`login-demo-role ${a.roleClass || ''}`}>{a.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
