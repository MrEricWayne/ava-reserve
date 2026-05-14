import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../lib/AuthContext'
import { getGallery, addGalleryItem, updateGalleryItem, deleteGalleryItem, uploadImage } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function GalleryPage() {
  const { user, profile } = useAuth()
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => { loadGallery() }, [])

  async function loadGallery() {
    setLoading(true)
    const { data } = await getGallery()
    setItems(data || [])
    setLoading(false)
  }

  async function handleUpload(files, existingId = null) {
    if (!files.length) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const path = `gallery/${Date.now()}-${file.name}`
      const { url, error } = await uploadImage(file, path)
      if (error) { toast.error('Upload failed: ' + error.message); continue }

      if (existingId) {
        // Replace existing item's image
        await updateGalleryItem(existingId, { public_url: url, storage_path: path })
        toast.success('Photo updated!')
      } else {
        // Add new gallery item
        const title = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
        await addGalleryItem({ title, caption: 'Shop photo', public_url: url, storage_path: path, sort_order: items.length + 1 })
        toast.success('Photo added!')
      }
    }
    setUploading(false)
    loadGallery()
  }

  async function handleDelete(id) {
    if (!confirm('Remove this photo?')) return
    await deleteGalleryItem(id)
    toast.success('Photo removed')
    loadGallery()
  }

  const isAdmin = profile?.is_admin

  return (
    <>
      <Navbar />
      <div className="page-header">
        <span className="page-header-eyebrow">Our Space</span>
        <h1>SHOP GALLERY</h1>
        <p>Ava Reserve — Sacramento's premier DIY auto space</p>
      </div>

      <div className="section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 28 }}>SHOP PHOTOS</h2>
            {isAdmin && <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Click any photo to replace it · You have admin upload access</p>}
          </div>
          {isAdmin && (
            <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
              {uploading ? '⏳ Uploading...' : '📷 Upload Photos'}
              <input type="file" accept="image/*" multiple style={{ display: 'none' }}
                onChange={e => handleUpload(e.target.files)} disabled={uploading} />
            </label>
          )}
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /> Loading gallery...</div>
        ) : (
          <div className="gallery-grid">
            {items.map(item => (
              <div key={item.id} className="gallery-card">
                <div className="gallery-img">
                  {item.public_url
                    ? <img src={item.public_url} alt={item.title} />
                    : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
                        <span style={{ fontSize: 36, opacity: .4 }}>🏗️</span>
                        <span>{item.title}</span>
                      </div>
                  }
                  {isAdmin && (
                    <label className="gallery-img-overlay" style={{ cursor: 'pointer' }}>
                      📷 Replace
                      <input type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={e => handleUpload(e.target.files, item.id)} />
                    </label>
                  )}
                </div>
                <div className="gallery-caption">
                  <h4>{item.title}</h4>
                  <p>{item.caption}</p>
                  {isAdmin && (
                    <button onClick={() => handleDelete(item.id)} style={{ marginTop: 6, fontSize: 11, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', padding: 0 }}>
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add new slot — admin only */}
            {isAdmin && (
              <label className="gallery-add">
                <span style={{ fontSize: 32 }}>+</span>
                <span>Add New Photo</span>
                <input type="file" accept="image/*" multiple style={{ display: 'none' }}
                  onChange={e => handleUpload(e.target.files)} />
              </label>
            )}
          </div>
        )}

        {!loading && items.length === 0 && !isAdmin && (
          <div className="empty-state">
            <div className="empty-icon">📷</div>
            <p>No photos yet — check back soon.</p>
          </div>
        )}
      </div>
    </>
  )
}
