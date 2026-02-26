'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { PRICE_RANGES } from '@/lib/types'

export default function VendorDashboard() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState('profile')
  const [vendor, setVendor] = useState<any>(null)
  const [isNew, setIsNew] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [allSpecialties, setAllSpecialties] = useState<any[]>([])
  const [selectedSpecialties, setSelectedSpecialties] = useState<number[]>([])
  const [services, setServices] = useState<any[]>([])
  const [newServiceName, setNewServiceName] = useState('')
  const [newServicePrice, setNewServicePrice] = useState('')
  const [messages, setMessages] = useState<any[]>([])

  const [form, setForm] = useState({
    business_name: '', slug: '', tagline: '', description: '',
    category_id: 'wedding-planners', city_id: '', phone: '',
    email: '', website: '', price_range: 'mid',
  })

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth?mode=login'); return }

      const [catRes, cityRes, specRes] = await Promise.all([
        supabase.from('service_categories').select('*').order('sort_order'),
        supabase.from('cities').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('specialty_tags').select('*').order('name'),
      ])
      if (catRes.data) setCategories(catRes.data)
      if (cityRes.data) setCities(cityRes.data)
      if (specRes.data) setAllSpecialties(specRes.data)

      const { data: existing } = await supabase.from('vendors').select('*').eq('user_id', session.user.id).single()

      if (existing) {
        setVendor(existing)
        setForm({
          business_name: existing.business_name || '', slug: existing.slug || '',
          tagline: existing.tagline || '', description: existing.description || '',
          category_id: existing.category_id || 'wedding-planners',
          city_id: existing.city_id?.toString() || '', phone: existing.phone || '',
          email: existing.email || '', website: existing.website || '',
          price_range: existing.price_range || 'mid',
        })
        const [specJoin, servRes, msgRes] = await Promise.all([
          supabase.from('vendor_specialties').select('specialty_id').eq('vendor_id', existing.id),
          supabase.from('vendor_services').select('*').eq('vendor_id', existing.id).order('sort_order'),
          supabase.from('contact_messages').select('*').eq('vendor_id', existing.id).order('created_at', { ascending: false }),
        ])
        if (specJoin.data) setSelectedSpecialties(specJoin.data.map(s => s.specialty_id))
        if (servRes.data) setServices(servRes.data)
        if (msgRes.data) setMessages(msgRes.data)
      } else {
        setIsNew(true)
        setForm(f => ({ ...f, email: session.user.email || '' }))
      }
      setLoading(false)
    }
    init()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const vendorData = {
      user_id: session.user.id, business_name: form.business_name,
      slug: form.slug || generateSlug(form.business_name),
      tagline: form.tagline, description: form.description,
      category_id: form.category_id, city_id: form.city_id ? parseInt(form.city_id) : null,
      phone: form.phone, email: form.email, website: form.website, price_range: form.price_range,
    }

    let vendorId = vendor?.id
    if (isNew) {
      const { data } = await supabase.from('vendors').insert(vendorData).select().single()
      if (data) { setVendor(data); vendorId = data.id; setIsNew(false) }
    } else {
      await supabase.from('vendors').update(vendorData).eq('id', vendor.id)
    }

    if (vendorId) {
      await supabase.from('vendor_specialties').delete().eq('vendor_id', vendorId)
      if (selectedSpecialties.length > 0) {
        await supabase.from('vendor_specialties').insert(selectedSpecialties.map(sid => ({ vendor_id: vendorId, specialty_id: sid })))
      }
    }

    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addService = async () => {
    if (!newServiceName || !vendor?.id) return
    const { data } = await supabase.from('vendor_services').insert({
      vendor_id: vendor.id, name: newServiceName, price_display: newServicePrice || null, sort_order: services.length,
    }).select().single()
    if (data) setServices([...services, data])
    setNewServiceName(''); setNewServicePrice('')
  }

  const removeService = async (id: number) => {
    await supabase.from('vendor_services').delete().eq('id', id)
    setServices(services.filter(s => s.id !== id))
  }

  const markRead = async (id: string) => {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', id)
    setMessages(messages.map(m => m.id === id ? { ...m, is_read: true } : m))
  }

  if (loading) return <div className="min-h-[70vh] bg-brand-bg flex items-center justify-center font-body text-brand-muted">Loading dashboard...</div>

  const tabs = [
    { id: 'profile', label: 'Business Details' },
    { id: 'services', label: 'Services & Fees' },
    { id: 'specialties', label: 'Specialties' },
    { id: 'images', label: 'Images' },
    { id: 'messages', label: `Messages${messages.filter(m => !m.is_read).length > 0 ? ` (${messages.filter(m => !m.is_read).length})` : ''}` },
  ]

  return (
    <div className="bg-brand-bg min-h-[80vh]">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-display text-4xl text-brand-text mb-2">Vendor Dashboard</h1>
        <p className="font-body text-[15px] text-brand-muted mb-8">Manage your business profile</p>

        {/* Status */}
        <div className={`rounded-xl p-4 px-6 mb-8 flex items-center justify-between border ${vendor?.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="font-body text-sm">
            <b>Status:</b>{' '}
            {vendor?.status === 'approved' ? <span className="text-green-700">✓ Approved & Live</span>
              : isNew ? <span className="text-amber-700">📝 Not yet submitted — fill in your details and save</span>
              : <span className="text-amber-700">⏳ Pending Admin Approval</span>}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-8 border-b-2 border-brand-border overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`py-3 px-6 font-body text-sm border-b-2 -mb-[2px] transition-colors whitespace-nowrap ${tab === t.id ? 'font-bold text-brand-accent border-brand-accent' : 'font-medium text-brand-muted border-transparent'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 border border-brand-border">
          {/* PROFILE */}
          {tab === 'profile' && (
            <div className="space-y-5">
              <div>
                <label className="font-body text-[13px] font-semibold mb-1.5 block">Business Name</label>
                <input value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value, slug: generateSlug(e.target.value) })} placeholder="Your business name" className="input-field" />
              </div>
              <div>
                <label className="font-body text-[13px] font-semibold mb-1.5 block">Tagline</label>
                <input value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} placeholder="A short catchy description" className="input-field" />
              </div>
              <div>
                <label className="font-body text-[13px] font-semibold mb-1.5 block">About Your Business</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe your services, experience..." rows={5} className="input-field resize-vertical" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-[13px] font-semibold mb-1.5 block">Category</label>
                  <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="input-field">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-body text-[13px] font-semibold mb-1.5 block">City</label>
                  <select value={form.city_id} onChange={e => setForm({ ...form, city_id: e.target.value })} className="input-field">
                    <option value="">Select city...</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="font-body text-[13px] font-semibold mb-1.5 block">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+34 6XX XXX XXX" className="input-field" /></div>
                <div><label className="font-body text-[13px] font-semibold mb-1.5 block">Website</label><input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="www.yourbusiness.es" className="input-field" /></div>
              </div>
              <div>
                <label className="font-body text-[13px] font-semibold mb-2 block">Price Range</label>
                <div className="flex gap-3">
                  {PRICE_RANGES.map(pr => (
                    <button key={pr.id} onClick={() => setForm({ ...form, price_range: pr.id })}
                      className={`flex-1 py-3 rounded-xl border-2 font-body text-[13px] transition-all ${form.price_range === pr.id ? 'border-brand-accent bg-brand-accent-light text-brand-accent font-semibold' : 'border-brand-border text-brand-text'}`}>
                      <div className="font-semibold">{pr.label}</div>
                      <div className="text-[11px] opacity-70 mt-0.5">{pr.range}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SERVICES */}
          {tab === 'services' && (
            <div>
              <h3 className="font-display text-xl text-brand-text mb-4">Your Services</h3>
              {services.length > 0 && (
                <div className="space-y-0 mb-6">
                  {services.map(s => (
                    <div key={s.id} className="flex items-center justify-between py-3 border-b border-brand-border">
                      <span className="font-body text-sm">{s.name}</span>
                      <div className="flex items-center gap-3">
                        {s.price_display && <span className="font-body text-sm font-semibold text-brand-accent">{s.price_display}</span>}
                        <button onClick={() => removeService(s.id)} className="text-brand-muted hover:text-red-500 text-lg">×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-3">
                <input value={newServiceName} onChange={e => setNewServiceName(e.target.value)} placeholder="Service name..." className="input-field !flex-1" />
                <input value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} placeholder="Price (e.g. €5,000 – €10,000)" className="input-field !flex-1" />
                <button onClick={addService} className="btn-primary !text-sm whitespace-nowrap">Add</button>
              </div>
              {!vendor && <p className="font-body text-xs text-brand-muted mt-3">Save your profile first before adding services.</p>}
            </div>
          )}

          {/* SPECIALTIES */}
          {tab === 'specialties' && (
            <div>
              <h3 className="font-display text-xl text-brand-text mb-2">Wedding Specialties</h3>
              <p className="font-body text-sm text-brand-muted mb-6">Select all that apply — couples can filter by these</p>
              <div className="grid grid-cols-2 gap-3">
                {allSpecialties.map(tag => (
                  <button key={tag.id} onClick={() => setSelectedSpecialties(
                    selectedSpecialties.includes(tag.id) ? selectedSpecialties.filter(s => s !== tag.id) : [...selectedSpecialties, tag.id]
                  )} className={`py-3.5 px-5 rounded-xl text-left border-2 font-body text-sm transition-all ${
                    selectedSpecialties.includes(tag.id) ? 'border-brand-accent bg-brand-accent-light text-brand-accent font-semibold' : 'border-brand-border text-brand-text'
                  }`}>
                    {selectedSpecialties.includes(tag.id) ? '✓ ' : ''}{tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* IMAGES */}
          {tab === 'images' && (
            <div>
              <h3 className="font-display text-xl text-brand-text mb-2">Portfolio Images</h3>
              <p className="font-body text-sm text-brand-muted mb-6">Upload photos to showcase your work</p>
              <div className="border-2 border-dashed border-brand-border rounded-2xl p-16 text-center cursor-pointer hover:border-brand-accent transition-colors">
                <div className="text-5xl mb-3 opacity-40">📷</div>
                <p className="font-body text-[15px] font-semibold mb-1">Drag & drop images here</p>
                <p className="font-body text-[13px] text-brand-muted">or click to browse (PNG, JPG up to 10MB)</p>
              </div>
              <p className="font-body text-xs text-brand-muted mt-3">Storage bucket is ready — image upload will work once deployed.</p>
            </div>
          )}

          {/* MESSAGES */}
          {tab === 'messages' && (
            <div>
              <h3 className="font-display text-xl text-brand-text mb-4">Enquiries from Couples</h3>
              {messages.length === 0 ? (
                <p className="font-body text-sm text-brand-muted">No messages yet. They&apos;ll appear here when couples contact you.</p>
              ) : messages.map(m => (
                <div key={m.id} className={`p-5 rounded-xl mb-3 border ${m.is_read ? 'bg-white border-brand-border' : 'bg-brand-accent-light border-brand-accent/20'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-body text-sm font-semibold">{m.sender_name}</div>
                      <div className="font-body text-xs text-brand-muted">{m.sender_email} · {new Date(m.created_at).toLocaleDateString()}</div>
                    </div>
                    {!m.is_read && <button onClick={() => markRead(m.id)} className="font-body text-xs text-brand-accent font-semibold">Mark read</button>}
                  </div>
                  {m.wedding_date && <div className="font-body text-xs text-brand-muted mb-2">Wedding date: {m.wedding_date}</div>}
                  <p className="font-body text-sm text-brand-text/85 leading-relaxed">{m.message}</p>
                </div>
              ))}
            </div>
          )}

          {/* Save button (not on messages tab) */}
          {tab !== 'messages' && (
            <div className="mt-8 flex items-center gap-3">
              <button onClick={handleSave} disabled={saving} className="btn-primary !px-12 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              {saved && <span className="font-body text-sm text-green-700 font-semibold">✓ Saved!</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
