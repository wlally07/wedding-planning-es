import Link from 'next/link'
import { Stars } from './Stars'
import { PRICE_RANGES } from '@/lib/types'

export function VendorCard({ vendor }: { vendor: any }) {
  const priceLabel = PRICE_RANGES.find(p => p.id === vendor.price_range)?.label || ''
  return (
    <Link href={`/vendor/${vendor.slug}`} className="card block overflow-hidden">
      <div className="h-[200px] bg-gradient-to-br from-brand-deep to-brand-bg flex items-center justify-center relative">
        {vendor.primary_image_url ? (
          <img src={vendor.primary_image_url} alt={vendor.business_name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl opacity-40">{vendor.category_icon || '💍'}</span>
        )}
        {vendor.is_featured && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-brand-accent text-white">⭐ Featured</span>
        )}
        <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-brand-accent-light text-brand-accent border border-brand-border/50">
          {vendor.category_label}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl text-brand-text mb-1">{vendor.business_name}</h3>
        <p className="font-body text-[13px] text-brand-muted mb-3">📍 {vendor.city_name} · {priceLabel}</p>
        {vendor.tagline && <p className="font-body text-sm text-brand-text/80 mb-4 leading-relaxed line-clamp-2">{vendor.tagline}</p>}
        {vendor.specialties?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-4">
            {vendor.specialties.slice(0, 3).map((s: string) => (
              <span key={s} className="px-2.5 py-1 rounded-md bg-brand-accent-light font-body text-[11px] text-brand-accent font-medium">{s}</span>
            ))}
            {vendor.specialties.length > 3 && <span className="font-body text-[11px] text-brand-muted py-1">+{vendor.specialties.length - 3} more</span>}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Stars rating={vendor.avg_rating} />
          <span className="font-body text-[13px] text-brand-muted">
            {vendor.avg_rating > 0 ? `${vendor.avg_rating} (${vendor.review_count})` : 'New'}
          </span>
        </div>
      </div>
    </Link>
  )
}
