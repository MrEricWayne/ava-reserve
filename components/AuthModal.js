import { useState } from 'react'
import { useRouter } from 'next/router'
import { signIn, signUp } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function AuthModal({ onClose, defaultTab = 'login' }) {
  const [tab, setTab]         = useState(defaultTab)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Login fields
  const [email, setEmail] = useState('')
  const [pass, setPass]   = useState('')

  // Register fields
  const [first, setFirst]   = useState('')
  const [last, setLast]     = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [phone, setPhone]   = useState('')
  const [regPass, setRegPass]   = useState('')
  const [tier, setTier]     = useState('regular')

  async function handleLogin(e) {
    e.preventDefault()
    if (!email || !pass) { toast.error('Enter email and password'); return }
    setLoading(true)
    const { error } = await signIn({ email, password: pass })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Welcome back!')
    onClose()
    router.push('/dashboard')
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (!first || !regEmail || !regPass) { toast.error('Fill in all required fields'); return }
    if (regPass.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    const { error } = await signUp({
      email: regEmail, password: regPass,
      firstName: first, lastName: last, phone, tier
    })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Account created! Check your email to confirm.')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>AVA RESERVE</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-tabs">
            <button className={`modal-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Sign In</button>
            <button className={`modal-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Create Account</button>
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" required />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
              <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'var(--text-muted)' }}>
                Don't have an account?{' '}
                <span style={{ color: 'var(--red)', cursor: 'pointer' }} onClick={() => setTab('register')}>Create one</span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input type="text" value={first} onChange={e => setFirst(e.target.value)} placeholder="John" required />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" value={last} onChange={e => setLast(e.target.value)} placeholder="Doe" />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="your@email.com" required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 000-0000" />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input type="password" value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="Min. 6 characters" required />
              </div>
              <div className="form-group">
                <label>Membership Tier</label>
                <select value={tier} onChange={e => setTier(e.target.value)}>
                  <option value="regular">Regular — Free</option>
                  <option value="premium">Premium — $49/mo</option>
                  <option value="vip">VIP — $99/mo</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account →'}
              </button>
              <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <span style={{ color: 'var(--red)', cursor: 'pointer' }} onClick={() => setTab('login')}>Sign in</span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
