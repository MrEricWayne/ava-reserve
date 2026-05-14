import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { useAuth } from '../lib/AuthContext'
import { getMyBookings, updateBookingStatus, updateProfile, uploadImage } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const router = useRouter()

  const [bookings, setBookings]       = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [editMode, setEditMode]       = useState(false)
  const [saving, setSaving]           = useState(false)

  // Profile edit fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [phone, setPhone]         = useState('')

  useEffect(() => {
    if (!loading && !user) { router.push('/'); return }
    if (user) loadData()
  }, [user, loading])

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '')
      setLastName(profile.last_name  || '')
      setPhone(profile.phone || '')
    }
  }, [profile])

  async function loadData() {
    setLoadingData(true)
    const { data } = await getMyBookings(user.id)
    setBookings(data || [])
    setLoadingData(false)
  }

  async function cancelBooking(id) {
    if (!confirm('Cancel this booking?')) return
    const { error } = await updateBookingStatus(id, 'cancelled')
    if (error) { toast.error('Failed to cancel'); return }
    toast.success('Booking cancelled')
    loadData()
  }

  async function saveProfile() {
    setSaving(true)
    const { error } = await updateProfile(user.id, {
      first_name: firstName, last_name: lastName, phone
    })
    setSaving(false)
    if (error) { toast.error('Save failed: ' + error.message); return }
    await refreshProfile()
    toast.success('Profile updated!')
    setEditMode(false)
  }

  async function upgradeTier(tier) {
    const { error } = await updateProfile(user.id, { tier })
    if (error) { toast.error('Update failed'); return }
    await refreshProfile()
    toast.success(`Membership updated to ${tier.charAt(0).toUpperCase() + tier.slice(1)}!`)
  }

  if (loading || loadingData) return (
    <>
      <Navbar />
      <div className="loading" style={{ minHeight: '60vh' }}><div className="spinner" /> Loading your dashboard...</div>
    </>
  )

  if (!user || !profile) return null

  const upcoming  = bookings.filter(b => b.status === 'confirmed')
  const completed = bookings.filter(b => b.status === 'completed')
  const initials  = (profile.first_name?.[0] || '') + (profile.last_name?.[0] || '')
  const tierLabel = profile.tier === 'vip' ? '⭐ VIP Elite Member' : profile.tier === 'premium' ? '🔩 Premium Member' : '⚙ Regular Member'
  const tierClass = profile.tier === 'vip' ? 'tier-vip' : profile.tier === 'premium' ? 'tier-premium' : 'tier-regular'
  const disc      = profile.tier === 'vip' ? 25 : profile.tier === 'premium' ? 15 : 0
  const savings   = disc > 0 ? '$' + Math.round(completed.length * 35 * disc / 100) : '$0'
  const nextBooking = upcoming[0]

  return (
    <>
      <Navbar />
      <div className="page-header">
        <span className="page-header-eyebrow">My Account</span>
        <h1>DASHBOARD</h1>
        <p>Manage your bookings, profile, and membership</p>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 2rem' }}>
        {/* Welcome + tier */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 32 }}>WELCOME BACK, {profile.first_name?.toUpperCase()}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>{user.email}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className={`tier-badge ${tierClass}`} style={{ fontSize: 13, padding: '7px 16px' }}>{tierLabel}</span>
            <Link href="/pricing" className="btn btn-outline btn-sm">Upgrade Plan</Link>
            {profile.is_admin && <Link href="/admin" className="btn btn-primary btn-sm">⚙ Admin Panel</Link>}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 16, marginBottom: 28 }}>
          <div className="stat-card">
            <div className="stat-label">Total Bookings</div>
            <div className="stat-value">{bookings.length}</div>
            <div className="stat-sub">All time</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Upcoming</div>
            <div className="stat-value stat-accent">{upcoming.length}</div>
            <div className="stat-sub">Confirmed sessions</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Next Session</div>
            <div className="stat-value" style={{ fontSize: nextBooking ? 22 : 42 }}>
              {nextBooking ? nextBooking.time_slot : '—'}
            </div>
            <div className="stat-sub">{nextBooking ? nextBooking.date : 'No upcoming bookings'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Member Savings</div>
            <div className="stat-value">{savings}</div>
            <div className="stat-sub">{disc}% member discount</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
          <div>
            {/* Bookings table */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header">
                <span className="card-title">My Bookings</span>
                <Link href="/book" className="btn btn-primary btn-sm">+ New Booking</Link>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {bookings.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📅</div>
                    <p>No bookings yet. <Link href="/book">Book your first bay →</Link></p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr><th>Date</th><th>Time</th><th>Bay</th><th>Service</th><th>Status</th><th></th></tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id}>
                          <td>{b.date}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{b.time_slot}</td>
                          <td style={{ fontSize: 12 }}>{b.bay}</td>
                          <td>{b.service}</td>
                          <td>
                            <span className={`tag ${b.status === 'confirmed' ? 'tag-success' : b.status === 'cancelled' ? 'tag-danger' : 'tag-neutral'}`}>
                              {b.status}
                            </span>
                          </td>
                          <td>
                            {b.status === 'confirmed' && (
                              <button className="btn btn-danger btn-sm" onClick={() => cancelBooking(b.id)}>Cancel</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          <div>
            {/* Profile card */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header">
                <span className="card-title">My Profile</span>
                <button className="btn btn-outline btn-sm" onClick={() => setEditMode(e => !e)}>
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div className="user-avatar" style={{ width: 52, height: 52, fontSize: 20 }}>{initials.toUpperCase() || '?'}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{profile.first_name} {profile.last_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>
                </div>

                {editMode ? (
                  <div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name</label>
                        <input value={firstName} onChange={e => setFirstName(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input value={lastName} onChange={e => setLastName(e.target.value)} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 000-0000" />
                    </div>
                    <button className="btn btn-primary btn-block" onClick={saveProfile} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="divider" />
                    <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Membership</span>
                        <span className={`tier-badge ${tierClass}`}>{profile.tier}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Phone</span>
                        <span>{profile.phone || '—'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Member Since</span>
                        <span>{new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upgrade card */}
            <div className="card">
              <div className="card-header"><span className="card-title">Membership</span></div>
              <div className="card-body">
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.6 }}>
                  {profile.tier === 'vip' ? '⭐ You have full VIP access — all perks unlocked!'
                   : profile.tier === 'premium' ? '🔩 You are on Premium. Upgrade to VIP for unlimited hours.'
                   : '⚙ Upgrade for priority booking, discounts, and lift bay access.'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {profile.tier !== 'regular'  && <button className="btn btn-outline btn-sm" onClick={() => upgradeTier('regular')}>Downgrade to Regular (Free)</button>}
                  {profile.tier !== 'premium'  && <button className="btn btn-outline btn-sm" onClick={() => upgradeTier('premium')}>Switch to Premium — $49/mo</button>}
                  {profile.tier !== 'vip'      && <button className="btn btn-primary btn-sm" onClick={() => upgradeTier('vip')}>Upgrade to VIP — $99/mo ⭐</button>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
