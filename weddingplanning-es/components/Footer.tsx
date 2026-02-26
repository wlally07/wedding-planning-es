import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-brand-text pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
          <div>
            <div className="font-display text-xl text-white mb-2">
              Wedding<span className="text-brand-accent">Planning</span>
              <span className="text-xs opacity-50">.es</span>
            </div>
            <p className="font-body text-sm text-white/50 max-w-[280px] leading-relaxed">
              Spain&apos;s premier wedding directory connecting couples with the finest wedding professionals.
            </p>
          </div>
          <div className="flex gap-16">
            <div>
              <h4 className="font-body text-xs font-bold text-white mb-3 uppercase tracking-widest">For Vendors</h4>
              <Link href="/auth?mode=register&role=vendor" className="block font-body text-sm text-white/50 mb-2 hover:text-white/80">List Your Business</Link>
              <Link href="/auth?mode=login" className="block font-body text-sm text-white/50 mb-2 hover:text-white/80">Vendor Login</Link>
            </div>
            <div>
              <h4 className="font-body text-xs font-bold text-white mb-3 uppercase tracking-widest">Company</h4>
              <span className="block font-body text-sm text-white/50 mb-2">Privacy Policy</span>
              <span className="block font-body text-sm text-white/50 mb-2">Terms of Service</span>
              <span className="block font-body text-sm text-white/50 mb-2">Contact Us</span>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6">
          <p className="font-body text-xs text-white/30 text-center">
            © {new Date().getFullYear()} WeddingPlanning.es — All rights reserved
          </p>
        </div>
      </div>
    </footer>
  )
}
