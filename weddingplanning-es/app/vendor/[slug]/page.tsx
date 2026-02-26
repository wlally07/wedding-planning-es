import { createClient } from '@/lib/supabase-server'
import { Stars } from '@/components/Stars'
import { PRICE_RANGES } from '@/lib/types'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ContactForm } from './ContactForm'

interface Props { params: Promise<{ slug: string }> }

export default async function VendorPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*, service_categories(id, label, icon), cities(id, name, slug)')
    .eq('slug', slug).eq('status', 'approved').single()

  if (!vendor) notFound()

  const [servicesRes, specialtiesRes, reviewsRes, imagesRes] = await Promise.all([
    supabase.from('vendor_services').select('*').eq('vendor_id', vendor.id).order('sort_order'),
    supabase.from('vendor_specialties').select('specialty_id, specialty_tags(name)').eq('vendor_id', vendor.id),
    supabase.from('reviews').select('*').eq('vendor_id', vendor.id).eq('status', 'published').order('created_at', { ascending: false }),
    supabase.from('vendor_images').select('*').eq('vendor_id', vendor.id).order('sort_order'),
  ])

  const services = servicesRes.data || []
  const specialties = (specialtiesRes.data || []).map((s: any) => s.specialty_tags?.name).filter(Boolean)
  const reviews = reviewsRes.data || []
  const images = imagesRes.data || []
  const cat = vendor.service_categories as any
  const city = vendor.cities as any
  const price = PRICE_RANGES.find(p => p.id === vendor.price_range)

  return (
    <div className="bg-brand-bg min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="font-body text-[13px] text-brand-muted mb-6 flex gap-2">
          <Link href="/" className="text-brand-accent hover:underline">Home</Link><span>/</span>
          <Link href={`/search?category=${cat?.id}`} className="text-brand-accent hover:underline">{cat?.label}</Link><span>/</span>
          <span>{vendor.business_name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          <div>
            {/* Hero image */}
            <div className="h-[360px] bg-gradient-to-br from-brand-deep to-brand-bg rounded-[20px] flex items-center justify-center relative overflow-hidden mb-8">
              {images.length > 0 ? (
                <img src={(images.find((i: any) => i.is_primary) || images[0]).url} alt={vendor.business_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[80px] opacity-30">{cat?.icon}</span>
              )}
              {vendor.is_featured && <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-brand-accent text-white">⭐ Featured</span>}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                {images.map((img: any) => <img key={img.id} src={img.url} alt={img.alt_text || ''} className="h-24 w-32 object-cover rounded-xl flex-shrink-0" />)}
              </div>
            )}

            <h1 className="font-display text-4xl text-brand-text mb-2">{vendor.business_name}</h1>
            {vendor.tagline && <p className="font-body text-lg text-brand-muted mb-4 italic">{vendor.tagline}</p>}

            <div className="flex gap-4 items-center mb-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Stars rating={vendor.avg_rating} size={20} />
                <span className="font-body text-[15px] font-semibold">{vendor.avg_rating}</span>
                <span className="font-body text-sm text-brand-muted">({vendor.review_count} reviews)</span>
              </div>
              <span className="text-brand-border">|</span>
              <span className="font-body text-sm text-brand-muted">📍 {city?.name}</span>
              {price && <><span className="text-brand-border">|</span><span className="font-body text-sm text-brand-muted">{price.label} · {price.range}</span></>}
            </div>

            {specialties.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-8">
                {specialties.map((s: string) => <span key={s} className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-accent-light text-brand-accent">{s}</span>)}
              </div>
            )}

            {vendor.description && (
              <div className="bg-white rounded-2xl p-8 mb-6 border border-brand-border">
                <h3 className="font-display text-[22px] text-brand-text mb-4">About</h3>
                <p className="font-body text-[15px] text-brand-text/85 leading-relaxed">{vendor.description}</p>
              </div>
            )}

            {services.length > 0 && (
              <div className="bg-white rounded-2xl p-8 mb-6 border border-brand-border">
                <h3 className="font-display text-[22px] text-brand-text mb-4">Services & Pricing</h3>
                {services.map((s: any) => (
                  <div key={s.id} className="flex justify-between py-3 border-b border-brand-border last:border-none">
                    <span className="font-body text-sm">{s.name}</span>
                    {s.price_display && <span className="font-body text-sm font-semibold text-brand-accent">{s.price_display}</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-8 border border-brand-border">
              <h3 className="font-display text-[22px] text-brand-text mb-6">Reviews ({reviews.length})</h3>
              {reviews.length === 0 ? (
                <p className="font-body text-sm text-brand-muted">No reviews yet.</p>
              ) : reviews.map((r: any) => (
                <div key={r.id} className="py-5 border-b border-brand-border last:border-none">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-accent-light flex items-center justify-center font-body text-sm font-bold text-brand-accent">{r.author_name[0]}</div>
                      <div>
                        <div className="font-body text-sm font-semibold">{r.author_name}</div>
                        <div className="font-body text-xs text-brand-muted">{new Date(r.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <Stars rating={r.rating} size={14} />
                  </div>
                  <p className="font-body text-sm text-brand-text/85 leading-relaxed pl-12">{r.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div><ContactForm vendor={vendor} /></div>
        </div>
      </div>
    </div>
  )
}
