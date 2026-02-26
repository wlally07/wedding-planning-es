import { createClient } from '@/lib/supabase-server'
import { VendorCard } from '@/components/VendorCard'
import { SearchBox } from '@/components/SearchBox'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const [categoriesRes, featuredRes] = await Promise.all([
    supabase.from('service_categories').select('*').order('sort_order'),
    supabase.from('vendor_listings').select('*').eq('is_featured', true).limit(6),
  ])
  const categories = categoriesRes.data || []
  const featured = featuredRes.data || []

  return (
    <div>
      {/* HERO */}
      <section className="bg-gradient-to-b from-brand-bg to-brand-deep py-24 relative overflow-hidden">
        <div className="absolute top-10 left-[10%] text-[40px] opacity-15 -rotate-[15deg]">💐</div>
        <div className="absolute top-20 right-[12%] text-[36px] opacity-15 rotate-[10deg]">✨</div>
        <div className="absolute bottom-16 left-[15%] text-[32px] opacity-[0.12] rotate-[20deg]">💒</div>
        <div className="absolute bottom-10 right-[18%] text-[38px] opacity-[0.12]">🥂</div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h1 className="font-display text-5xl md:text-[64px] font-bold text-brand-text leading-[1.1] mb-4 tracking-tight">
            Find Your Perfect<br />
            <span className="text-brand-accent">Wedding Team</span> in Spain
          </h1>
          <p className="font-body text-lg text-brand-muted max-w-[560px] mx-auto mb-12 leading-relaxed">
            Discover top-rated wedding planners, photographers, florists, and more. Your dream wedding in Spain starts here.
          </p>
          <div className="max-w-[800px] mx-auto">
            <SearchBox />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-display text-4xl text-brand-text text-center mb-3">Browse by Category</h2>
          <p className="font-body text-base text-brand-muted text-center mb-12">Everything you need to plan your perfect day</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-5">
            {categories.map((cat: any) => (
              <Link key={cat.id} href={`/search?category=${cat.id}`} className="card !rounded-2xl p-8 text-center">
                <div className="text-[40px] mb-3">{cat.icon}</div>
                <div className="font-body text-sm font-semibold text-brand-text">{cat.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="py-20 bg-brand-deep">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-display text-4xl text-brand-text text-center mb-3">Featured Professionals</h2>
            <p className="font-body text-base text-brand-muted text-center mb-12">Hand-picked, verified wedding professionals across Spain</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((v: any) => <VendorCard key={v.id} vendor={v} />)}
            </div>
          </div>
        </section>
      )}

      {/* VENDOR CTA */}
      <section className="py-20 bg-brand-text">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl text-white mb-3">Are You a Wedding Professional?</h2>
          <p className="font-body text-base text-white/60 max-w-[500px] mx-auto mb-9">
            Join Spain&apos;s premier wedding directory. Showcase your services, reach engaged couples, and grow your business.
          </p>
          <Link href="/auth?mode=register&role=vendor" className="btn-primary !text-base !px-12 !py-4">
            List Your Business — It&apos;s Free
          </Link>
        </div>
      </section>
    </div>
  )
}
