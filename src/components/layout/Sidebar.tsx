'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Users,
  Truck,
  TrendingUp,
  Bell,
  Settings,
  ChevronRight,
  LogOut,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import GlobalSearch from '@/components/ui/GlobalSearch'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: FileText, label: 'Documentos', href: '/documents' },
  { icon: FolderOpen, label: 'Legajos', href: '/legajos' },
  { icon: Users, label: 'Personal', href: '/personnel' },
  { icon: Truck, label: 'Flota', href: '/vehicles' },
  { icon: TrendingUp, label: 'Presupuestos', href: '/budgets' },
]

const aiItems = [
  { icon: FileText, label: 'Contratos', href: '/contracts' },
  { icon: Zap, label: 'Facturas IA', href: '/invoices' },
]

const secondaryItems = [
  { icon: Bell, label: 'Alertas', href: '/alerts' },
  { icon: Settings, label: 'Configuración', href: '/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col sidebar-shadow fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <span className="font-bold text-base tracking-tight text-gray-900 leading-none">Strategic</span>
          <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Connex</span>
        </div>
      </div>

      {/* Main Menu */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6 pt-4">
        
        {/* Global Search Trigger */}
        <GlobalSearch />

        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
            Módulos
          </p>
          <nav className="space-y-0.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150',
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 font-semibold'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon size={18} className={cn(isActive ? 'text-indigo-600' : 'text-gray-400')} />
                  <span className="text-sm">{item.label}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto text-indigo-400" />}
                </Link>
              )
            })}
          </nav>
        </div>

        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
            IA & Auditoría
          </p>
          <nav className="space-y-0.5">
            {aiItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150',
                    isActive
                      ? 'bg-purple-50 text-purple-600 font-semibold'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon size={18} className={cn(isActive ? 'text-purple-600' : 'text-gray-400')} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
            Sistema
          </p>
          <nav className="space-y-0.5">
            {secondaryItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150',
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 font-semibold'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon size={18} className={cn(isActive ? 'text-indigo-600' : 'text-gray-400')} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut size={18} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}
