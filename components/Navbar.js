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
    setMenuOpen(false)
    router.push('/')
  }

  function closeMenu() { setMenuOpen(false) }

  const initials = profile
    ? (profile.first_name?.[0] || '') + (profile.last_name?.[0] || '')
    : '?'

  const tierClass = profile?.tier === 'vip' ? 'tier-vip'
    : profile?.tier === 'premium' ? 'tier-premium' : 'tier-regular'
  const tierLabel = profile?.tier === 'vip' ? 'VIP'
    : profile?.tier === 'premium' ? 'PRO' : 'REG'

  const navLinks = [
    { href: '/',          label: 'Home' },
    { href: '/book',      label: 'Book a Bay' },
    { href: '/pricing',   label: 'Pricing' },
    { href: '/gallery',   label: 'Gallery' },
    ...(user && profile?.is_admin ? [{ href: '/admin', label: 'Admin', red: true }] : []),
    ...(user ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
  ]

  return (
    <>
      <nav style={{
        background: 'var(--dark)', height: 64, padding: '0 1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 20px rgba(0,0,0,0.25)'
      }}>
        <Link href="/" style={{ textDecoration: 'none' }} onClick={closeMenu}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400,
            color: 'white', letterSpacing: 4, textTransform: 'uppercase'
          }}>
            AVA <span style={{ color: 'var(--red)' }}>RESERVE</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} style={{
              fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
              color: l.red ? 'var(--red)' : router.pathname === l.href ? 'var(--red)' : '#A0A0A0',
              padding: '8px 12px', borderRadius: 4, textDecoration: 'none',
              background: router.pathname === l.href ? 'rgba(192,39,45,0.1)' : 'transparent',
            }}>
              {l.label}
            </Link>
          ))}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
              <Link href="/dashboard" style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: 'rgba(255,255,255,0.08)', borderRadius: 32,
                padding: '4px 12px 4px 4px', textDecoration: 'none'
              }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'white' }}>
                  {initials.toUpperCase()}
                </div>
                <span style={{ color: '#ccc', fontSize: 12 }}>{profile?.first_name}</span>
                <span className={`tier-badge ${tierClass}`}>{tierLabel}</span>
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>Sign Out</button>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAuth(true)} style={{ marginLeft: 8 }}>Sign In</button>
          )}
        </div>

        {/* Mobile right side */}
        <div style={{ display: 'none', alignItems: 'center', gap: 10 }} className="mobile-nav">
          {user ? (
            <Link href="/dashboard" onClick={closeMenu} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'white', textDecoration: 'none' }}>
              {initials.toUpperCase()}
            </Link>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => { setShowAuth(true); closeMenu() }}>Sign In</button>
          )}
          <button onClick={() => setMenuOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', flexDirection: 'column', gap: 5 }} aria-label="Menu">
            <span style={{ display: 'block', width: 22, height: 2, background: menuOpen ? 'var(--red)' : 'white', borderRadius: 2, transition: 'transform .2s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <span style={{ display: 'block', width: 22, height: 2, background: 'white', borderRadius: 2, opacity: menuOpen ? 0 : 1, transition: 'opacity .2s' }} />
            <span style={{ display: 'block', width: 22, height: 2, background: menuOpen ? 'var(--red)' : 'white', borderRadius: 2, transition: 'transform .2s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: 64, left: 0, right: 0, bottom: 0, background: 'var(--dark)', zIndex: 99, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={closeMenu} style={{
              fontSize: 22, fontFamily: 'var(--font-display)', letterSpacing: 3, textTransform: 'uppercase',
              textDecoration: 'none', color: router.pathname === l.href ? 'var(--red)' : 'white',
              padding: '18px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              {l.label}
              <span style={{ color: 'var(--red)', fontSize: 16 }}>›</span>
            </Link>
          ))}
          <div style={{ padding: '24px 28px', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {user ? (
              <>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 14 }}>
                  Signed in as <span style={{ color: 'white' }}>{profile?.first_name} {profile?.last_name}</span>
                </div>
                <button className="btn btn-danger btn-block" onClick={handleSignOut}>Sign Out</button>
              </>
            ) : (
              <button className="btn btn-primary btn-block" onClick={() => { setShowAuth(true); closeMenu() }}>
                Sign In / Create Account
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav  { display: flex !important; }
        }
      `}</style>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
