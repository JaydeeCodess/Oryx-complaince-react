import { useState } from 'react'

export default function LoginPage({ onLogin, showToast }) {
  const [email, setEmail] = useState('admin@company.com')
  const [pass, setPass] = useState('password')

  const doLogin = () => {
    if (!email || !pass) { showToast('Please enter email and password', 'error'); return }
    onLogin()
  }

  return (
    <div id="login-page">
      <div className="login-card">
        <div className="login-logo">ORYX</div>
        <div className="login-sub">HR Management Compliance · Sign in to continue</div>
        <div className="form-group mb-4">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@company.com" />
        </div>
        <div className="form-group" style={{ marginBottom: 24 }}>
          <label className="form-label">Password</label>
          <input className="form-input" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && doLogin()} />
        </div>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={doLogin}>Sign In →</button>
        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>Demo: any email + any password</div>
      </div>
    </div>
  )
}
