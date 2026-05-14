import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import AuthModal from '../components/AuthModal'
import { useAuth } from '../lib/AuthContext'

const PLANS = [
  {
    tier: 'Starter', name: 'REGULAR', price: 'Free', period: '',
    desc: 'Perfect for occasional use. Pay per session with no monthly commitment.',
    features: [
      { label: 'Bay rental access', yes: true },
      { label: 'Basic tool library', yes: true },
      { label: 'Online booking system', yes: true },
      { label: 'Lounge & WiFi', yes: true },
      { label: 'Priority booking', yes: false },
      { label: 'Member discount', yes: false },
      { label: 'Lift bay access', yes: false },
      { label: 'Guest passes', yes: false },
    ],
    cta: 'Get Started Free', featured: false
  },
  {
    tier: 'Pro Wrench', name: 'PREMIUM', price: '$49', period: '/month',
    desc: 'Ideal for enthusiasts doing regular work. Save on every visit with priority access.',
    features: [
      { label: 'Everything in Regular', yes: true },
      { label: 'Priority booking (+24hr window)', yes: true },
      { label: '15% off all bay rentals', yes: true },
      { label: 'Lift bay access (Bay 3)', yes: true },
      { label: 'Full pro tool library', yes: true },
      { label: '2 guest passes / month', yes: true },
      { label: 'OBD diagnostic scanner', yes: true },
      { label: 'Dedicated storage locker', yes: false },
    ],
    cta: 'Join Premium', featured: true
  },
  {
    tier: 'Elite', name: 'VIP', price: '$99', period: '/month',
    desc: 'For the serious builder. Unlimited access, your own locker, and white-glove perks.',
    features: [
      { label: 'Everything in Premium', yes: true },
      { label: 'Unlimited bay hours', yes: true },
      { label: 'Priority + 48hr advance window', yes: true },
      { label: '25% off all rentals', yes: true },
      { label: 'Dedicated storage locker', yes: true },
      { label: '5 guest passes / month', yes: true },
      { label: 'Free monthly inspection', yes: true },
      { label: 'VIP lounge access + coffee bar', yes: true },
    ],
    cta: 'Join VIP →', featured: false
  }
]

const PAY_PER_USE = [
  { label: 'Standard Bay', sub: 'Bays 1 & 2', price: '$35', per: '/hr' },
  { label: 'Lift Bay', sub: 'Bay 3 — 2-post lift', price: '$50', per: '/hr' },
  { label: 'Alignment Bay', sub: 'Bay 4 — Hunter system', price: '$45', per: '/hr' },
  { label: 'Detailing Pod', sub: 'Bay 5 — climate controlled', price: '$60', per: '/hr' },
  { label: 'Quick Service', sub: 'Up to 45 minutes', price: '$25', per: '/session' },
]

export default function PricingPage() {
  const { user } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <>
      <Navbar />
      <div className="page-header">
        <span className="page-header-eyebrow">Plans</span>
        <h1>MEMBERSHIP TIERS</h1>
        <p>Choose the plan that works for your garage needs</p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 2rem 64px' }}>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto 48px', fontSize: 15, lineHeight: 1.7 }}>
          All memberships include bay access, tool use, and WiFi. Upgrade for priority booking, discounts, and extra hours.
        </p>

        {/* Pricing cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, marginBottom: 48 }}>
          {PLANS.map(plan => (
            <div key={plan.name} className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
              {plan.featured && <div className="popular-badge">MOST POPULAR</div>}
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--red)', marginBottom: 10 }}>{plan.tier}</div>
              <div className="pricing-name">{plan.name}</div>
              <div className="pricing-price">
                <span className="price">{plan.price}</span>
                <span className="period">{plan.period}</span>
              </div>
              <p className="pricing-desc">{plan.desc}</p>
              <ul className="pricing-features">
                {plan.features.map(f => (
                  <li key={f.label} className={`pricing-feature ${f.yes ? 'included' : ''}`}>
                    <span className={`check-icon ${f.yes ? 'check-yes' : 'check-no'}`}>{f.yes ? '✓' : '✗'}</span>
                    {f.label}
                  </li>
                ))}
              </ul>
              <button
                className={`btn btn-block ${plan.featured ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => user ? null : setShowAuth(true)}>
                {user ? <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>{plan.cta}</Link> : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Pay-per-use rates */}
        <div className="card">
          <div className="card-header"><span className="card-title">Pay-Per-Use Bay Rates</span></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14 }}>
              {PAY_PER_USE.map(r => (
                <div key={r.label} style={{ textAlign: 'center', padding: 16, background: 'var(--gray)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>{r.price}<span style={{ fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}>{r.per}</span></div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <Link href="/book" className="btn btn-primary btn-lg">Book a Session →</Link>
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
