import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSession } from '../state/SessionContext';
import { BrandMark } from '../components/BrandMark';
import { FORGOT_PATH } from '../app/routes';

export function LoginPage() {
  const { status, login } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (status === 'authenticated') return <Navigate to="/app" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try { await login(email, password); }
    catch (err) { setError((err as Error).message || 'Login failed'); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-page">
      <BrandMark variant="login" />
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <div className="form-group-auth">
          <label className="auth-label" htmlFor="email">Email</label>
          <input id="email" className="auth-input" type="email" placeholder="Email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-group-auth">
          <label className="auth-label" htmlFor="password">Password</label>
          <div className="auth-input-wrap">
            <input id="password" className="auth-input has-eye" type={showPassword ? 'text' : 'password'} placeholder="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="auth-eye" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((s) => !s)}>
              <i className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`} />
            </button>
          </div>
        </div>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <div className="form-group-auth">
          <button className="auth-submit" type="submit" disabled={busy}>LOGIN</button>
        </div>
        <div className="form-group-auth" style={{ textAlign: 'center' }}>
          <Link className="auth-link" to={FORGOT_PATH}>Forgot Password?</Link>
        </div>
      </form>
    </div>
  );
}
