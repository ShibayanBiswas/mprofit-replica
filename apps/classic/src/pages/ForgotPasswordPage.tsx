import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { classicApi } from '../api/classicApi';
import { BrandMark } from '../components/BrandMark';
import { LOGIN_PATH } from '../app/routes';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [haveCode, setHaveCode] = useState(false);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await classicApi.forgotPassword(email).catch(() => ({ message: 'Unable to send reset request.' }));
    setMessage(res.message);
  };
  const onReset = (e: FormEvent) => { e.preventDefault(); setMessage('Password reset is not connected in this environment.'); };

  return (
    <div className="auth-page">
      <BrandMark variant="login" />
      {!haveCode ? (
        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <div className="form-group-auth">
            <label className="auth-label" htmlFor="email">Email</label>
            <input id="email" className="auth-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {message && <div className="auth-info" role="status">{message}</div>}
          <div className="form-group-auth"><button className="auth-submit" type="submit">Request Password Reset</button></div>
          <div className="form-group-auth" style={{ textAlign: 'center' }}>
            <button type="button" className="auth-link auth-link-btn" onClick={() => setHaveCode(true)}>Already have a password reset code?</button>
          </div>
          <div className="form-group-auth" style={{ textAlign: 'center' }}><Link className="auth-link" to={LOGIN_PATH}>Back to Login</Link></div>
        </form>
      ) : (
        <form className="auth-form" onSubmit={onReset} noValidate>
          <div className="form-group-auth">
            <label className="auth-label" htmlFor="code">Reset Code</label>
            <input id="code" className="auth-input" placeholder="Reset Code" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className="form-group-auth">
            <label className="auth-label" htmlFor="np">New Password</label>
            <input id="np" className="auth-input" type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          {message && <div className="auth-info" role="status">{message}</div>}
          <div className="form-group-auth"><button className="auth-submit" type="submit">Reset Password</button></div>
          <div className="form-group-auth" style={{ textAlign: 'center' }}>
            <button type="button" className="auth-link auth-link-btn" onClick={() => setHaveCode(false)}>Request a new code</button>
          </div>
          <div className="form-group-auth" style={{ textAlign: 'center' }}><Link className="auth-link" to={LOGIN_PATH}>Back to Login</Link></div>
        </form>
      )}
    </div>
  );
}
