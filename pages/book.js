import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import AuthModal from '../components/AuthModal'
import { useAuth } from '../lib/AuthContext'
import { getBookingsForDate, createBooking, getMyBookings } from '../lib/supabase'
import toast from 'react-hot-toast'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday } from 'date-fns'

const DAYS     = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const TIMES    = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM']
const BAYS     = ['Bay 1 — Standard','Bay 2 — Standard','Bay 3 — Lift Bay','Bay 4 — Alignment','Bay 5 — Detailing Pod']
const SERVICES = [
  { icon: '🛢️', name: 'Oil Change',  price: 'from $25' },
  { icon: '🔧', name: 'Brakes',      price: 'from $80' },
  { icon: '✨', name: 'Detailing',   price: 'from $120' },
  { icon: '💻', name: 'Diagnostic',  price: 'from $40' },
  { icon: '🚗', name: 'Bay Rental',  price: '$35/hr' },
  { icon: '🔩', name: 'Other',       price: 'Quote' },
]

export default function BookPage() {
  const { user } = useAuth()
  const router   = useRouter()

  const [currentMonth, setCurrentMonth]       = useState(new Date())
  const [selectedDate, setSelectedDate]       = useState(null)
  const [dateBookings, setDateBookings]       = useState([])
  const [myBookings, setMyBookings]           = useState([])
  const [loadingSlots, setLoadingSlots]       = useState(false)
  const [showAuth, setShowAuth]               = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Booking form
  const [selectedTime, setSelectedTime]       = useState('')
  const [selectedBay, setSelectedBay]         = useState(BAYS[0])
  const [selectedService, setSelectedService] = useState('Oil Change')
  const [vehicle, setVehicle]                 = useState('')
  const [notes, setNotes]                     = useState('')
  const [submitting, setSubmitting]           = useState(false)

  useEffect(() => {
    if (user) loadMyBookings()
  }, [user])

  async function loadMyBookings() {
    const { data } = await getMyBookings(user.id)
    setMyBookings(data || [])
  }

  async function selectDate(date) {
    setSelectedDate(date)
    setLoadingSlots(true)
    const { data } = await getBookingsForDate(format(date, 'yyyy-MM-dd'))
    setDateBookings(data || [])
    setLoadingSlots(false)
  }

  function bookSlot(time) {
    if (!user) { setShowAuth(true); return }
    setSelectedTime(time)
    setShowBookingModal(true)
  }

  async function submitBooking(e) {
    e.preventDefault()
    if (!selectedDate || !selectedTime) { toast.error('Select a date and time first'); return }
    if (!vehicle.trim()) { toast.error('Enter your vehicle details'); return }
    setSubmitting(true)
    const { error } = await createBooking({
      user_id: user.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time_slot: selectedTime,
      bay: selectedBay,
      service: selectedService,
      vehicle,
      notes,
      status: 'confirmed'
    })
    setSubmitting(false)
    if (error) { toast.error('Booking failed: ' + error.message); return }
    toast.success('Bay booked! See you then 🔧')
    setShowBookingModal(false)
    setVehicle('')
    setNotes('')
    await loadMyBookings()
    if (selectedDate) await selectDate(selectedDate)
  }

  // Calendar grid
  const monthStart = startOfMonth(currentMonth)
  const monthEnd   = endOfMonth(currentMonth)
  const days       = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad   = getDay(monthStart)

  function isMyBookingDate(date) {
    return myBookings.some(b => b.status === 'confirmed' && b.date === format(date, 'yyyy-MM-dd'))
  }

  const takenTimes = dateBookings.map(b => b.time_slot)
  const myTimes    = myBookings
    .filter(b => selectedDate && b.date === format(selectedDate, 'yyyy-MM-dd') && b.status === 'confirmed')
    .map(b => b.time_slot)

  return (
    <>
      <Navbar />

      <div className="page-header">
        <span className="page-header-eyebrow">Reservations</span>
        <h1>BOOK A BAY</h1>
        <p>Select a date, pick a time, and confirm your reservation</p>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 1.25rem' }}>

        {/* Month navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setCurrentMonth(m => subMonths(m, 1))}
              style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--white)', cursor: 'pointer', fontSize: 18 }}>
              ‹
            </button>
            <h2 style={{ fontSize: 26 }}>{format(currentMonth, 'MMMM yyyy')}</h2>
            <button
              onClick={() => setCurrentMonth(m => addMonths(m, 1))}
              style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--white)', cursor: 'pointer', fontSize: 18 }}>
              ›
            </button>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--red-light)', marginRight: 4 }} />Mine</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#DBEAFE', marginRight: 4 }} />Booked</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'var(--success-bg)', marginRight: 4 }} />Available</span>
          </div>
        </div>

        {/* Calendar + slots grid — stacks on mobile via CSS class */}
        <div className="cal-layout">

          {/* Calendar */}
          <div className="card">
            <div className="card-body" style={{ padding: 10 }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="cal-table" style={{ minWidth: 280 }}>
                  <thead>
                    <tr>{DAYS.map(d => <th key={d}>{d}</th>)}</tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: Math.ceil((days.length + startPad) / 7) }).map((_, rowIdx) => (
                      <tr key={rowIdx}>
                        {Array.from({ length: 7 }).map((_, colIdx) => {
                          const dayIdx = rowIdx * 7 + colIdx - startPad
                          const day    = days[dayIdx]
                          if (!day) return <td key={colIdx} className="other-month" />
                          const isSelected = selectedDate && isSameDay(day, selectedDate)
                          const isMine     = isMyBookingDate(day)
                          return (
                            <td
                              key={colIdx}
                              className={isToday(day) ? 'today' : ''}
                              onClick={() => selectDate(day)}
                              style={{ outline: isSelected ? '2px solid var(--red)' : 'none', outlineOffset: -2 }}>
                              <span className="day-num">{format(day, 'd')}</span>
                              {isMine && <div className="cal-event ev-mine" style={{ display: 'none' }}>Mine</div>}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Time slots */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Available Times'}
              </span>
            </div>
            <div className="card-body">
              {!selectedDate ? (
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <p>Tap a date to see available times</p>
                </div>
              ) : loadingSlots ? (
                <div className="loading"><div className="spinner" /> Loading...</div>
              ) : (
                <>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                    {TIMES.length - takenTimes.length} of {TIMES.length} slots available
                  </p>
                  <div style={{ maxHeight: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {TIMES.map(time => {
                      const isMine  = myTimes.includes(time)
                      const isTaken = takenTimes.includes(time) && !isMine
                      return (
                        <div
                          key={time}
                          className={`slot-item ${isTaken ? 'taken' : ''}`}
                          onClick={() => !isTaken && bookSlot(time)}>
                          <div>
                            <div className="slot-time">{time}</div>
                            <div className="slot-info">1–2 hr session · All bays</div>
                          </div>
                          <span className={`slot-status ${isMine ? 'status-mine' : isTaken ? 'status-taken' : 'status-open'}`}>
                            {isMine ? 'Mine' : isTaken ? 'Taken' : 'Book'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

        {/* My upcoming bookings */}
        {user && myBookings.filter(b => b.status === 'confirmed').length > 0 && (
          <div className="card" style={{ marginTop: 24 }}>
            <div className="card-header">
              <span className="card-title">My Upcoming Bookings</span>
            </div>
            <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
              <table className="data-table" style={{ minWidth: 500 }}>
                <thead>
                  <tr><th>Date</th><th>Time</th><th>Bay</th><th>Service</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {myBookings.filter(b => b.status === 'confirmed').slice(0, 5).map(b => (
                    <tr key={b.id}>
                      <td>{b.date}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{b.time_slot}</td>
                      <td>{b.bay}</td>
                      <td>{b.service}</td>
                      <td><span className="tag tag-success">Confirmed</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowBookingModal(false)}>
          <div className="modal" style={{ width: 'min(520px, 95vw)' }}>
            <div className="modal-header">
              <h2>BOOK A BAY</h2>
              <button className="modal-close" onClick={() => setShowBookingModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form onSubmit={submitBooking}>
                <div className="form-group">
                  <label>Date & Time</label>
                  <input
                    readOnly
                    value={selectedDate ? format(selectedDate, 'MMM d, yyyy') + ' @ ' + selectedTime : ''}
                    style={{ background: 'var(--gray)' }}
                  />
                </div>
                <div className="form-group">
                  <label>Bay / Space</label>
                  <select value={selectedBay} onChange={e => setSelectedBay(e.target.value)}>
                    {BAYS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Service Type</label>
                  <div className="service-grid">
                    {SERVICES.map(s => (
                      <button
                        type="button"
                        key={s.name}
                        className={`service-opt ${selectedService === s.name ? 'selected' : ''}`}
                        onClick={() => setSelectedService(s.name)}>
                        <span className="s-icon">{s.icon}</span>
                        <span className="s-name">{s.name}</span>
                        <span className="s-price">{s.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Vehicle (Year / Make / Model) *</label>
                  <input
                    type="text"
                    value={vehicle}
                    onChange={e => setVehicle(e.target.value)}
                    placeholder="e.g. 2018 Ford Mustang GT"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Anything we should know..."
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowBookingModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={submitting}>
                    {submitting ? 'Confirming...' : 'Confirm Booking →'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
