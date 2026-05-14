import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import { useAuth } from '../lib/AuthContext'
import { getAllBookings, getAllProfiles, updateBookingStatus, getGallery, uploadImage, addGalleryItem, deleteGalleryItem } from '../lib/supabase'
import toast from 'react-hot-toast'

const SECTIONS = ['overview','bookings','members','gallery','settings']

export default function AdminPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [section, setSection]       = useState('overview')
  const [bookings, setBookings]     = useState([])
  const [members, setMembers]       = useState([])
  const [gallery, setGallery]       = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [uploading, setUploading]   = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push('/'); return }
      if (!profile?.is_admin) { toast.error('Admin access only'); router.push('/dashboard'); return }
      loadAll()
    }
  }, [user, profile, loading])

  async function loadAll() {
    setLoadingData(true)
    const [b, m, g] = await Promise.all([getAllBookings(), getAllProfiles(), getGallery()])
    setBookings(b.data || [])
    setMembers(m.data || [])
    setGallery(g.data || [])
    setLoadingData(false)
  }

  async function cancelBooking(id) {
    if (!confirm('Cancel this booking?')) return
    await updateBookingStatus(id, 'cancelled')
    toast.success('Booking cancelled')
    loadAll()
  }

  async function completeBooking(id) {
    await updateBookingStatus(id, 'completed')
    toast.success('Booking marked complete')
    loadAll()
  }

  async function handleGalleryUpload(files) {
    setUploading(true)
    for (const file of Array.from(files)) {
      const path = `gallery/${Date.now()}-${file.name}`
      const { url, error } = await uploadImage(file, path)
      if (error) { toast.error('Upload failed'); continue }
      const title = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
      await addGalleryItem({ title, caption: 'Shop photo', public_url: url, storage_path: path, sort_order: gallery.length + 1 })
      toast.success('Photo added!')
    }
    setUploading(false)
    loadAll()
  }

  async function removeGalleryItem(id) {
    if (!confirm('Remove this photo?')) return
    await deleteGalleryItem(id)
    toast.success('Photo removed')
    loadAll()
  }

  if (loading || loadingData) return (
    <>
      <Navbar />
      <div className="loading" style={{ minHeight: '60vh' }}><div className="spinner" /> Loading admin panel...</div>
    </>
  )

  const today         = new Date().toISOString().split('T')[0]
  const todayBookings = bookings.filter(b => b.date === today).length
  const revenue       = members.filter(m => m.tier === 'premium').length * 49 + members.filter(m => m.tier === 'vip').length * 99
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length

  return (
    <>
      <Navbar />
      <div className="page-header">
        <span className="page-header-eyebrow">Management</span>
        <h1>ADMIN PANEL</h1>
        <p>Ava Reserve — Full management console</p>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 2rem' }}>
        <div className="admin-layout">
          {/* Sidebar */}
          <div>
            <ul className="admin-menu">
              {[
                ['overview','📊','Overview'],
                ['bookings','📅','All Bookings'],
                ['members','👥','Members'],
                ['gallery','📷','Gallery'],
                ['settings','⚙','Settings'],
              ].map(([key, icon, label]) => (
                <li key={key} className={`admin-menu-item ${section === key ? 'active' : ''}`}
                  onClick={() => setSection(key)}>
                  {icon} {label}
                </li>
              ))}
              <li style={{ marginTop: 24 }}>
                <Link href="/dashboard" className="btn btn-outline btn-sm btn-block">← My Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Content */}
          <div>

            {/* OVERVIEW */}
            {section === 'overview' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 24 }}>
                  <div className="stat-card"><div className="stat-label">Total Bookings</div><div className="stat-value">{bookings.length}</div></div>
                  <div className="stat-card"><div className="stat-label">Confirmed</div><div className="stat-value stat-accent">{confirmedCount}</div></div>
                  <div className="stat-card"><div className="stat-label">Members</div><div className="stat-value">{members.length}</div></div>
                  <div className="stat-card"><div className="stat-label">Today</div><div className="stat-value">{todayBookings}</div></div>
                  <div className="stat-card"><div className="stat-label">Monthly Revenue</div><div className="stat-value" style={{ fontSize: 28 }}>${revenue}</div><div className="stat-sub">Membership only</div></div>
                </div>
                <div className="card">
                  <div className="card-header"><span className="card-title">Recent Bookings</span></div>
                  <div className="card-body" style={{ padding: 0 }}>
                    <table className="data-table">
                      <thead><tr><th>Member</th><th>Date</th><th>Time</th><th>Service</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {bookings.slice(0, 10).map(b => (
                          <tr key={b.id}>
                            <td>{b.profiles?.first_name} {b.profiles?.last_name}<br /><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.profiles?.email}</span></td>
                            <td>{b.date}</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{b.time_slot}</td>
                            <td>{b.service}</td>
                            <td><span className={`tag ${b.status === 'confirmed' ? 'tag-success' : b.status === 'cancelled' ? 'tag-danger' : 'tag-neutral'}`}>{b.status}</span></td>
                            <td style={{ display: 'flex', gap: 4 }}>
                              {b.status === 'confirmed' && <>
                                <button className="btn btn-sm btn-outline" onClick={() => completeBooking(b.id)}>Done</button>
                                <button className="btn btn-sm btn-danger" onClick={() => cancelBooking(b.id)}>Cancel</button>
                              </>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ALL BOOKINGS */}
            {section === 'bookings' && (
              <div className="card">
                <div className="card-header"><span className="card-title">All Bookings ({bookings.length})</span></div>
                <div className="card-body" style={{ padding: 0 }}>
                  <table className="data-table">
                    <thead><tr><th>Member</th><th>Date</th><th>Time</th><th>Bay</th><th>Service</th><th>Vehicle</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id}>
                          <td>{b.profiles?.first_name} {b.profiles?.last_name}</td>
                          <td>{b.date}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{b.time_slot}</td>
                          <td style={{ fontSize: 12 }}>{b.bay}</td>
                          <td>{b.service}</td>
                          <td style={{ fontSize: 12 }}>{b.vehicle}</td>
                          <td><span className={`tag ${b.status === 'confirmed' ? 'tag-success' : b.status === 'cancelled' ? 'tag-danger' : 'tag-neutral'}`}>{b.status}</span></td>
                          <td style={{ display: 'flex', gap: 4 }}>
                            {b.status === 'confirmed' && <>
                              <button className="btn btn-sm btn-outline" onClick={() => completeBooking(b.id)}>Done</button>
                              <button className="btn btn-sm btn-danger" onClick={() => cancelBooking(b.id)}>✕</button>
                            </>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MEMBERS */}
            {section === 'members' && (
              <div className="card">
                <div className="card-header"><span className="card-title">All Members ({members.length})</span></div>
                <div className="card-body" style={{ padding: 0 }}>
                  <table className="data-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Tier</th><th>Bookings</th><th>Joined</th><th>Admin</th></tr></thead>
                    <tbody>
                      {members.map(m => {
                        const bc = bookings.filter(b => b.user_id === m.id).length
                        const tc = m.tier === 'vip' ? 'tag-red' : m.tier === 'premium' ? 'tag-warning' : 'tag-neutral'
                        return (
                          <tr key={m.id}>
                            <td style={{ fontWeight: 600 }}>{m.first_name} {m.last_name}</td>
                            <td style={{ fontSize: 12 }}>{m.email || '—'}</td>
                            <td><span className={`tag ${tc}`}>{m.tier}</span></td>
                            <td>{bc}</td>
                            <td style={{ fontSize: 12 }}>{new Date(m.created_at).toLocaleDateString()}</td>
                            <td>{m.is_admin ? <span className="tag tag-danger">Admin</span> : '—'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* GALLERY */}
            {section === 'gallery' && (
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Gallery Manager ({gallery.length} photos)</span>
                  <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
                    {uploading ? '⏳ Uploading...' : '+ Add Photos'}
                    <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleGalleryUpload(e.target.files)} />
                  </label>
                </div>
                <div className="card-body">
                  <div className="gallery-grid">
                    {gallery.map(item => (
                      <div key={item.id} className="gallery-card">
                        <div className="gallery-img">
                          {item.public_url
                            ? <img src={item.public_url} alt={item.title} />
                            : <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
                                <div style={{ fontSize: 32, marginBottom: 8 }}>🏗️</div>
                                {item.title}
                              </div>
                          }
                        </div>
                        <div className="gallery-caption">
                          <h4>{item.title}</h4>
                          <p>{item.caption}</p>
                          <button onClick={() => removeGalleryItem(item.id)}
                            style={{ marginTop: 6, fontSize: 11, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)' }}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS */}
            {section === 'settings' && (
              <div className="card">
                <div className="card-header"><span className="card-title">Shop Settings</span></div>
                <div className="card-body">
                  <div className="alert alert-info">Changes here are for reference — connect to your database to persist settings.</div>
                  <div className="form-group"><label>Shop Name</label><input defaultValue="Ava Reserve" /></div>
                  <div className="form-group"><label>Address</label><input defaultValue="1234 Mather Field Rd, Rancho Cordova, CA" /></div>
                  <div className="form-row">
                    <div className="form-group"><label>Opening Time</label><input type="time" defaultValue="07:00" /></div>
                    <div className="form-group"><label>Closing Time</label><input type="time" defaultValue="21:00" /></div>
                  </div>
                  <div className="form-group"><label>Slot Duration (minutes)</label>
                    <select defaultValue="60"><option>30</option><option>60</option><option>90</option><option>120</option></select>
                  </div>
                  <div className="form-group"><label>Number of Active Bays</label>
                    <select defaultValue="5"><option>3</option><option>4</option><option>5</option></select>
                  </div>
                  <button className="btn btn-primary" onClick={() => toast.success('Settings saved!')}>Save Settings</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
