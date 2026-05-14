import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Auth helpers ──────────────────────────────

export async function signUp({ email, password, firstName, lastName, phone, tier }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName, phone, tier }
    }
  })
  return { data, error }
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signOut() {
  return await supabase.auth.signOut()
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// ── Profile helpers ───────────────────────────

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

// ── Booking helpers ───────────────────────────

export async function getMyBookings(userId) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  return { data, error }
}

export async function getAllBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select(`*, profiles(first_name, last_name, email, tier)`)
    .order('date', { ascending: false })
  return { data, error }
}

export async function getBookingsForDate(dateStr) {
  const { data, error } = await supabase
    .from('bookings')
    .select('time_slot, bay, user_id, status')
    .eq('date', dateStr)
    .neq('status', 'cancelled')
  return { data, error }
}

export async function createBooking(booking) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select()
    .single()
  return { data, error }
}

export async function updateBookingStatus(bookingId, status) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single()
  return { data, error }
}

// ── Gallery helpers ───────────────────────────

export async function getGallery() {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('sort_order', { ascending: true })
  return { data, error }
}

export async function addGalleryItem(item) {
  const { data, error } = await supabase
    .from('gallery')
    .insert([item])
    .select()
    .single()
  return { data, error }
}

export async function updateGalleryItem(id, updates) {
  const { data, error } = await supabase
    .from('gallery')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function deleteGalleryItem(id) {
  const { data, error } = await supabase
    .from('gallery')
    .delete()
    .eq('id', id)
  return { data, error }
}

export async function uploadImage(file, path) {
  const { data, error } = await supabase.storage
    .from('ava-reserve-images')
    .upload(path, file, { upsert: true })
  if (error) return { url: null, error }
  const { data: { publicUrl } } = supabase.storage
    .from('ava-reserve-images')
    .getPublicUrl(path)
  return { url: publicUrl, error: null }
}
