import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Wedding Planning ES — Find Wedding Professionals in Spain',
  description: 'Spain\'s premier wedding directory. Find wedding planners, photographers, florists, caterers, venues and more.',
  metadataBase: new URL('https://weddingplanning.es'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-bg">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
