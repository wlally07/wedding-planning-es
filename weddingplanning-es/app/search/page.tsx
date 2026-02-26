'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { VendorCard } from '@/components/VendorCard'
import { PRICE_RANGES } from '@/lib/types'

function SearchContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [categories, setCategories] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [specialties, setSpecialties] = useState<any[]>([])
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [specialty, setSpecialty] = useState('')
  const [priceRange, setPriceRange] = useState('')

  useEffect(() => {
    const load = async () => {
      const [c, ci, s] = await Promise.all([
        supabase.from('service_categories').select('*').order('sort_order'),
        supabase.from('cities').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('specialty_tags').select('*').order('name'),
      ])
      if (c.data) setCategories(c.data)
      if (ci.data) setCities(ci.data)
      if (s.data) setSpecialties(s.data)
    }
    load()
  }, [])

  useEffect(() => {
    const search = async () => {
      setLoading(true)
      const { data } = await supabase.rpc('search_vendors', {
        filter_category: category || null,
        filter_city_slug: city || null,
        filter_specialty_slug: specialty || null,
        filter_price_range: priceRange || null,
        sort_by: 'featured',
        page_limit: 50,
        page_offset: 0,
      })
      setVendors(data || [])
      setLoading(false)
    }
    search()
  }, [category, city, specialty, priceRange])

  return (
    <div className="bg-brand-bg min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl p-5 mb-8 flex flex-wrap gap-4 items-center border border-brand-border">
          <select value={category} onChange={e => setCategory(e.target.value)} className="input-field !w-auto min-w-[180px]">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
          <select value={city} onChange={e => setCity(e.target.value)} className="input-field !w-auto min-w-[160px]">
            <option value="">All Locations</option>
            {cities.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          <select value={specialty} onChange={e => setSpecialty(e.target.value)} className="input-field !w-auto min-w-[180px]">
            <option value="">All Specialties</option>
            {specialties.map(s => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>
          <select value={priceRange} onChange={e => setPriceRange(e.target.value)} className="input-field !w-auto min-w-[160px]">
            <option value="">All Prices</option>
            {PRICE_RANGES.map(p => <option key={p.id} value={p.id}>{p.label} — {p.range}</option>)}
          </select>
        </div>

        <p className="font-body text-sm text-brand-muted mb-6">
          {loading ? 'Searching...' : `Showing ${vendors.length} result${vendors.length !== 1 ? 's' : ''}`}
        </p>

        {!loading && vendors.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-[64px] mb-4 opacity-30">🔍</div>
            <h3 className="font-display text-2xl text-brand-text mb-2">No results found</h3>
            <p className="font-body text-brand-muted">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((v: any) => <VendorCard key={v.id} vendor={v} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return <Suspense fallback={<div className="min-h-[80vh] bg-brand-bg flex items-center justify-center font-body text-brand-muted">Loading...</div>}><SearchContent /></Suspense>
}
