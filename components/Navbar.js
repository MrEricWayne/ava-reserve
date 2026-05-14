import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/AuthContext'
import { signOut } from '../lib/supabase'
import toast from 'react-hot-toast'
import AuthModal from './AuthModal'

export default function Navbar() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [showAuth, setShowAuth] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    toast.success('Signed out')
    router.push('/')
  }

  const initials = profile
    ? (profile.first_name?.[0] || '') + (profile.last_name?.[0] || '')
    : '?'

  const tierClass = profile?.tier === 'vip' ? 'tier-vip'
    : profile?.tier === 'premium' ? 'tier-premium' : 'tier-regular'
  const tierLabel = profile?.tier === 'vip' ? 'VIP'
    : profile?.tier === 'premium' ? 'PRO' : 'REG'

  return (
    <>
      <nav className="navbar">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div className="nav-logo">AVA <span>RESERVE</span></div>
        </Link>

        <div className="nav-links">
          <Link href="/" className={`nav-link show-mobile ${router.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link href="/book" className={`nav-link ${router.pathname === '/book' ? 'active' : ''}`}>Book a Bay</Link>
          <Link href="/pricing" className={`nav-link ${router.pathname === '/pricing' ? 'active' : ''}`}>Pricing</Link>
          <Link href="/gallery" className={`nav-link ${router.pathname === '/gallery' ? 'active' : ''}`}>Gallery</Link>

          {user && profile?.is_admin && (
            <Link href="/admin" className={`nav-link ${router.pathname.startsWith('/admin') ? 'active' : ''}`}
              style={{ color: '#C0272D' }}>Admin</Link>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 8 }}>
              <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.08)', borderRadius: 32,
                padding: '5px 14px 5px 5px', textDecoration: 'none' }}>
                <div className="user-avatar" style={{ width: 30, height: 30, fontSize: 12 }}>
                  {initials.toUpperCase()}
                </div>
                <span style={{ color: '#ccc', fontSize: 13 }}>{profile?.first_name}</span>
                <span className={`tier-badge ${tierClass}`}>{tierLabel}</span>
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>Sign Out</button>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAuth(true)}
              style={{ marginLeft: 8 }}>Sign In</button>
          )}
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
