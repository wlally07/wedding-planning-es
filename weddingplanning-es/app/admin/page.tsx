'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function AdminPanel() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [vendors, setVendors] = useState<any[]>([])

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth?mode=login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
      if (profile?.role !== 'admin') { router.push('/'); return }

      const { data } = await supabase.from('vendors').select('*, service_categories(label, icon), cities(name)').order('created_at', { ascending: false })
      if (data) setVendors(data)
      setLoading(false)
    }
    init()
  }, [])

  const updateVendor = async (id: string, updates: any) => {
    await supabase.from('vendors').update(updates).eq('id', id)
    setVendors(vendors.map(v => v.id === id ? { ...v, ...updates } : v))
  }

  if (loading) return <div className="min-h-[70vh] bg-brand-bg flex items-center justify-center font-body text-brand-muted">Loading...</div>

  const pending = vendors.filter(v => v.status === 'pending')
  const approved = vendors.filter(v => v.status === 'approved')
  const suspended = vendors.filter(v => v.status === 'suspended')

  return (
    <div className="bg-brand-bg min-h-[80vh]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="font-display text-4xl text-brand-text mb-2">Admin Panel</h1>
        <p className="font-body text-[15px] text-brand-muted mb-8">Manage listings and approvals</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total', value: vendors.length, icon: '📋' },
            { label: 'Approved', value: approved.length, icon: '✅' },
            { label: 'Pending', value: pending.length, icon: '⏳' },
            { label: 'Featured', value: vendors.filter(v => v.is_featured).length, icon: '⭐' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-6 border border-brand-border">
              <div className="text-[28px] mb-2">{s.icon}</div>
              <div className="font-display text-[32px] font-bold">{s.value}</div>
              <div className="font-body text-[13px] text-brand-muted">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Pending */}
        {pending.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display text-2xl text-brand-text mb-4">⏳ Pending ({pending.length})</h2>
            {pending.map(v => (
              <div key={v.id} className="bg-white rounded-xl p-5 mb-3 border border-brand-border flex items-center justify-between">
                <div>
                  <div className="font-body text-base font-semibold">{v.business_name}</div>
                  <div className="font-body text-[13px] text-brand-muted">{(v.service_categories as any)?.label} · {(v.cities as any)?.name || 'No city'}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateVendor(v.id, { status: 'approved', approved_at: new Date().toISOString() })} className="px-5 py-2 rounded-lg bg-green-600 text-white font-body text-[13px] font-semibold">Approve</button>
                  <button onClick={() => updateVendor(v.id, { status: 'rejected' })} className="px-5 py-2 rounded-lg bg-red-600 text-white font-body text-[13px] font-semibold">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Approved */}
        <h2 className="font-display text-2xl text-brand-text mb-4">✅ Approved ({approved.length})</h2>
        {approved.length === 0 ? (
          <p className="font-body text-sm text-brand-muted mb-10">No approved listings yet.</p>
        ) : approved.map(v => (
          <div key={v.id} className="bg-white rounded-xl p-5 mb-3 border border-brand-border flex items-center justify-between">
            <div>
              <div className="font-body text-[15px] font-semibold">{v.business_name}</div>
              <div className="font-body text-[13px] text-brand-muted">{(v.service_categories as any)?.label} · {(v.cities as any)?.name || 'No city'} · ⭐ {v.avg_rating}</div>
            </div>
            <div className="flex gap-2 items-center">
              {v.is_featured && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-accent text-white">Featured</span>}
              <button onClick={() => updateVendor(v.id, { is_featured: !v.is_featured })} className="btn-secondary !text-xs !py-2 !px-4">
                {v.is_featured ? 'Unfeature' : 'Feature'}
              </button>
              <button onClick={() => updateVendor(v.id, { status: 'suspended' })} className="px-4 py-2 rounded-lg border border-red-200 bg-red-50 font-body text-xs text-red-600">Suspend</button>
            </div>
          </div>
        ))}

        {/* Suspended */}
        {suspended.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-2xl text-brand-text mb-4">🚫 Suspended ({suspended.length})</h2>
            {suspended.map(v => (
              <div key={v.id} className="bg-white rounded-xl p-5 mb-3 border border-brand-border flex items-center justify-between opacity-60">
                <div>
                  <div className="font-body text-[15px] font-semibold">{v.business_name}</div>
                  <div className="font-body text-[13px] text-brand-muted">{(v.service_categories as any)?.label}</div>
                </div>
                <button onClick={() => updateVendor(v.id, { status: 'approved' })} className="btn-secondary !text-xs !py-2 !px-4">Reinstate</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
