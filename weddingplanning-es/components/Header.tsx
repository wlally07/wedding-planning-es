'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'

export function Header() {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
        if (data) setRole(data.role)
      }
    }
    getUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
        if (data) setRole(data.role)
      } else { setUser(null); setRole(null) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-brand-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-[72px]">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-[26px] font-display font-bold text-brand-text">
            Wedding<span className="text-brand-accent">Planning</span>
          </span>
          <span className="text-xs text-brand-muted font-body font-medium mt-2">.es</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {role === 'vendor' && (
                <Link href="/vendor/dashboard" className="btn-secondary text-sm !py-2.5 !px-5">Dashboard</Link>
              )}
              {role === 'admin' && (
                <Link href="/admin" className="btn-secondary text-sm !py-2.5 !px-5">Admin</Link>
              )}
              <button onClick={handleLogout} className="btn-primary text-sm !py-2.5 !px-5">Log Out</button>
            </>
          ) : (
            <>
              <Link href="/auth?mode=login" className="btn-secondary text-sm !py-2.5 !px-5">Log In</Link>
              <Link href="/auth?mode=register" className="btn-primary text-sm !py-2.5 !px-5">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
