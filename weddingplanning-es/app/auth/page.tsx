'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

function AuthContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<'login' | 'register'>((searchParams.get('mode') as any) || 'login')
  const [role, setRole] = useState(searchParams.get('role') || 'bride')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError(''); setLoading(true)
    if (mode === 'register') {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name, role } } })
      if (error) setError(error.message)
      else router.push(role === 'vendor' ? '/vendor/dashboard' : '/')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else { router.push('/'); router.refresh() }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[70vh] bg-brand-bg flex items-center justify-center py-16">
      <div className="bg-white rounded-[20px] p-12 w-full max-w-[440px] shadow-[0_24px_80px_rgba(44,24,16,0.1)]">
        <h2 className="font-display text-[28px] text-brand-text mb-2">{mode === 'login' ? 'Welcome Back' : 'Join Us'}</h2>
        <p className="font-body text-sm text-brand-muted mb-8">{mode === 'login' ? 'Log in to your account' : 'Create your free account'}</p>

        {mode === 'register' && (
          <>
            <label className="font-body text-[13px] font-semibold text-brand-text mb-1.5 block">I am a...</label>
            <div className="flex gap-3 mb-6">
              {[{ val: 'bride', label: '💒 Couple' }, { val: 'vendor', label: '💼 Professional' }].map(o => (
                <button key={o.val} onClick={() => setRole(o.val)}
                  className={`flex-1 py-3.5 px-4 rounded-xl border-2 font-body text-[13px] font-medium transition-all ${role === o.val ? 'border-brand-accent bg-brand-accent-light text-brand-accent' : 'border-brand-border text-brand-text'}`}>
                  {o.label}
                </button>
              ))}
            </div>
            <div className="mb-5">
              <label className="font-body text-[13px] font-semibold text-brand-text mb-1.5 block">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="input-field" />
            </div>
          </>
        )}

        <div className="mb-5">
          <label className="font-body text-[13px] font-semibold text-brand-text mb-1.5 block">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email" className="input-field" />
        </div>
        <div className="mb-2">
          <label className="font-body text-[13px] font-semibold text-brand-text mb-1.5 block">Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type="password" className="input-field" />
        </div>

        {error && <p className="font-body text-xs text-red-500 mb-4">{error}</p>}

        <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full mt-4 disabled:opacity-50">
          {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
        </button>

        <p className="text-center font-body text-[13px] text-brand-muted mt-5">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-brand-accent font-semibold hover:underline">
            {mode === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return <Suspense fallback={<div className="min-h-[70vh] bg-brand-bg" />}><AuthContent /></Suspense>
}
