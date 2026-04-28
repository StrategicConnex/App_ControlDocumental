'use client'

// error.tsx — Error boundary global para el dashboard
// Captura errores de renderizado y de datos en toda la sección (dashboard)
import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to monitoring service in production
    console.error('[Dashboard Error]', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 p-8 bg-white rounded-[2rem] border border-gray-100 max-w-md w-full shadow-sm">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle size={32} className="text-rose-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Error al cargar</h2>
          <p className="text-sm text-gray-500 mt-2">
            Ocurrió un problema al conectar con la base de datos.
            {error.digest && (
              <span className="block mt-1 text-xs text-gray-400 font-mono">
                Ref: {error.digest}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw size={16} />
          Reintentar
        </button>
      </div>
    </div>
  )
}
