import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import AuthModal from '../components/AuthModal'
import { useAuth } from '../lib/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        background: 'var(--dark)', color: 'white',
        padding: '100px 2rem 90px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(-45deg,transparent,transparent 24px,rgba(255,255,255,0.018) 24px,rgba(255,255,255,0.018) 48px)'
        }} />
        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--red)', display: 'block', marginBottom: 16 }}>
            ⚙ Sacramento's Premier DIY Auto Space
          </span>
          <h1 style={{ color: 'white', marginBottom: 20, lineHeight: .95 }}>
            BOOK YOUR<br /><span style={{ color: 'var(--red)' }}>BAY TODAY</span>
          </h1>
          <p style={{ fontSize: 17, color: '#A0A0A0', marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
            Professional lifts, premium tools, and expert support. Rent by the hour or join for unlimited access.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/book" className="btn btn-primary btn-lg">📅 Book a Bay</Link>
            <Link href="/pricing" className="btn btn-ghost btn-lg">View Pricing</Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES STRIP ── */}
      <div style={{ background: 'var(--red)', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          ['🔧', '5 Equipped Bays'],
          ['🏗️', '2-Post & 4-Post Lifts'],
          ['💡', 'LED Lighting & Air Tools'],
          ['🛡️', 'Fully Insured Space'],
          ['📱', 'Online Booking'],
        ].map(([icon, label]) => (
          <div key={label} style={{ padding: '14px 24px', color: 'white', fontSize: 13, fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>{label}
          </div>
        ))}
      </div>

      {/* ── WHY US ── */}
      <div className="section">
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--red)', display: 'block', marginBottom: 10 }}>Why Ava Reserve</span>
          <h2>THE SHOP FOR EVERY WRENCH</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 10, maxWidth: 480, margin: '10px auto 0' }}>From weekend hobbyists to serious builds — we have the space and tools.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
          {[
            { icon: '🏗️', title: 'Professional Lifts', desc: 'BendPak 2-post and 4-post lifts rated to 10,000 lbs. Do the job right.' },
            { icon: '🔩', title: 'Full Tool Library', desc: 'Snap-on hand tools, torque wrenches, air tools, jack stands — all included.' },
            { icon: '💻', title: 'OBD Diagnostic', desc: 'Professional scanner and Hunter alignment system available in Bay 4.' },
            { icon: '☕', title: 'Lounge & WiFi', desc: 'Coffee, water, comfortable seating and high-speed wifi for your crew.' },
          ].map(f => (
            <div key={f.title} className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: 28 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 20, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          {user
            ? <Link href="/book" className="btn btn-primary btn-lg">Book Your Session →</Link>
            : <button className="btn btn-primary btn-lg" onClick={() => setShowAuth(true)}>Get Started Free →</button>
          }
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'var(--dark)', color: '#888', padding: '32px 2rem', textAlign: 'center', borderTop: '2px solid var(--red)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'white', letterSpacing: 4, marginBottom: 8 }}>
          AVA <span style={{ color: 'var(--red)' }}>RESERVE</span>
        </div>
        <p style={{ fontSize: 13 }}>1234 Mather Field Rd, Rancho Cordova, CA · (916) 555-0100</p>
        <p style={{ fontSize: 12, marginTop: 4 }}>Mon–Sat 7am–9pm · Sun 8am–6pm</p>
        <p style={{ fontSize: 11, marginTop: 16, color: '#555' }}>© {new Date().getFullYear()} Ava Reserve. All rights reserved.</p>
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
