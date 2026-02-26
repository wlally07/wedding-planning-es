'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export function ContactForm({ vendor }: { vendor: any }) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', message: '' })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async () => {
    if (!form.name || !form.email || !form.message) { setError('Please fill in name, email, and message.'); return }
    setError('')
    const { error: err } = await supabase.from('contact_messages').insert({
      vendor_id: vendor.id, sender_name: form.name, sender_email: form.email,
      sender_phone: form.phone || null, wedding_date: form.date || null, message: form.message,
    })
    if (err) setError('Please log in to send a message.')
    else setSent(true)
  }

  return (
    <div className="bg-white rounded-2xl p-7 border border-brand-border sticky top-24">
      <h3 className="font-display text-xl text-brand-text mb-5">Contact {vendor.business_name.split(' ')[0]}</h3>
      {sent ? (
        <div className="text-center py-6">
          <div className="text-4xl mb-3">💌</div>
          <p className="font-body text-sm font-semibold">Message sent!</p>
          <p className="font-body text-xs text-brand-muted">They&apos;ll get back to you shortly.</p>
        </div>
      ) : !open ? (
        <button onClick={() => setOpen(true)} className="btn-primary w-full mb-4">Send a Message</button>
      ) : (
        <div className="space-y-4 mb-4">
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="input-field" />
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" type="email" className="input-field" />
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone (optional)" className="input-field" />
          <input value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} placeholder="Wedding date (DD/MM/YYYY)" className="input-field" />
          <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell them about your wedding..." rows={4} className="input-field resize-vertical" />
          {error && <p className="font-body text-xs text-red-500">{error}</p>}
          <button onClick={handleSend} className="btn-primary w-full">Send Message</button>
        </div>
      )}
      <div className="border-t border-brand-border pt-5 space-y-3">
        {vendor.phone && <div className="font-body text-sm flex items-center gap-2">📞 <a href={`tel:${vendor.phone}`} className="hover:text-brand-accent">{vendor.phone}</a></div>}
        {vendor.email && <div className="font-body text-sm flex items-center gap-2">✉️ <a href={`mailto:${vendor.email}`} className="hover:text-brand-accent">{vendor.email}</a></div>}
        {vendor.website && <div className="font-body text-sm text-brand-accent flex items-center gap-2">🌐 {vendor.website}</div>}
      </div>
    </div>
  )
}
