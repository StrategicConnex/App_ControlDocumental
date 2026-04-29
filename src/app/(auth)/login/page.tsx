'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Lock, Mail, AlertCircle } from 'lucide-react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Environment, Float, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

// 3D Logo Component
function Logo3D() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // Load the logo texture. Adjust the path if necessary.
  const texture = useLoader(THREE.TextureLoader, '/Image/Logosc.png')
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle spin
      meshRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef}>
        <planeGeometry args={[2.5, 2.5]} />
        <meshStandardMaterial 
          map={texture} 
          transparent={true} 
          alphaTest={0.05} 
          side={THREE.DoubleSide} 
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  )
}

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Translucent Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')",
        }}
      >
        {/* Overlay gradient for legibility and aesthetic (Slate/Indigo tint) */}
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-black/80"></div>
      </div>

      {/* Decorative ambient lights */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light"></div>
      </div>

      <div className="w-full max-w-md relative z-10 px-4">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-indigo-500/20 rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-indigo-900/20 overflow-hidden relative">
          {/* Top accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent"></div>
          
          <div className="text-center mb-8 relative">
            {/* 3D Logo Canvas Container */}
            <div className="h-40 w-full mb-4 relative flex justify-center items-center">
              <Canvas className="pointer-events-none">
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
                <ambientLight intensity={1} />
                <directionalLight position={[10, 10, 10]} intensity={2} color="#818cf8" />
                <directionalLight position={[-10, -10, -10]} intensity={1} color="#60a5fa" />
                <Environment preset="city" />
                <Logo3D />
              </Canvas>
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2 drop-shadow-md">Strategic Connex</h1>
            <p className="text-indigo-200/70 text-sm font-medium tracking-wide uppercase">Plataforma Integral</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-widest ml-1" htmlFor="email">Email Institucional</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  id="email"
                  name="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@strategicconnex.com" 
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-widest" htmlFor="password">Contraseña</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  id="password"
                  name="password"
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 px-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Iniciando...</span>
                </>
              ) : (
                <span>Ingresar al Sistema</span>
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">SC Platform v3.0 &bull; Secure Industrial Access</p>
          </div>
        </div>

        {/* Support link */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            ¿Problemas de acceso? <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors underline decoration-indigo-400/30 underline-offset-4">Contactar Soporte IT</a>
          </p>
        </div>
      </div>
    </div>
  )
}
