'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export function SearchBox() {
  const router = useRouter()
  const supabase = createClient()
  const [categories, setCategories] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')

  useEffect(() => {
    const load = async () => {
      const [c, ci] = await Promise.all([
        supabase.from('service_categories').select('*').order('sort_order'),
        supabase.from('cities').select('*').eq('is_active', true).order('sort_order'),
      ])
      if (c.data) setCategories(c.data)
      if (ci.data) setCities(ci.data)
    }
    load()
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (city) params.set('city', city)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="bg-white rounded-[20px] p-2 shadow-[0_8px_40px_rgba(44,24,16,0.08)] flex items-center">
      <div className="flex-1 relative">
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="w-full px-5 py-4 border-none outline-none font-body text-[15px] bg-transparent cursor-pointer appearance-none text-brand-muted">
          <option value="">What are you looking for?</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </select>
      </div>
      <div className="w-px bg-brand-border self-stretch my-2" />
      <div className="flex-1 relative">
        <select value={city} onChange={e => setCity(e.target.value)}
          className="w-full px-5 py-4 border-none outline-none font-body text-[15px] bg-transparent cursor-pointer appearance-none text-brand-muted">
          <option value="">Where in Spain?</option>
          {cities.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </div>
      <button onClick={handleSearch} className="btn-primary !px-10 !py-4 !rounded-[14px] !text-[15px] whitespace-nowrap">
        Search
      </button>
    </div>
  )
}
