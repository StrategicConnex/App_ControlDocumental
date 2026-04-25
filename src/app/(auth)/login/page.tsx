'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Lock, Mail, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] p-4 font-sans selection:bg-purple-500/30 relative">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#121216]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-black/50 overflow-hidden relative">
          {/* Top accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center mb-6">
              <Image 
                src="/Image/Logosc.png" 
                alt="Strategic Connex Logo" 
                width={80}
                height={80}
                className="h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Strategic Connex</h1>
            <p className="text-gray-400 text-sm font-medium tracking-wide uppercase">Plataforma Integral</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500 text-sm">
                <AlertCircle size={18} />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest ml-1" htmlFor="email">Email Institucional</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                <input 
                  id="email"
                  name="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@strategicconnex.com" 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest" htmlFor="password">Contraseña</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                <input 
                  id="password"
                  name="password"
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all"
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 px-4 rounded-2xl transition-all shadow-xl shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Iniciando...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Iniciar Sesión
                </span>
              )}
            </button>
          </form>
          
          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">SC Platform v3.0 &bull; Secure Industrial Access</p>
          </div>
        </div>

        {/* Support link */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            ¿Problemas de acceso? <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">Contactar Soporte IT</a>
          </p>
        </div>
      </div>
    </div>
  )
}
