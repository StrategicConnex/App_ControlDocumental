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
  ShieldCheck,
  BarChart3,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useSidebar } from './SidebarProvider'
import { useUser } from '../providers/UserProvider'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/', permission: 'view_documents' },
  { icon: FileText, label: 'Documentos', href: '/documents', permission: 'view_documents' },
  { icon: FolderOpen, label: 'Legajos', href: '/legajos', permission: 'view_documents' },
  { icon: Users, label: 'Personal', href: '/personnel', permission: 'view_personnel' },
  { icon: Truck, label: 'Flota', href: '/vehicles', permission: 'view_vehicles' },
  { icon: TrendingUp, label: 'Presupuestos', href: '/budgets', permission: 'view_budgets' },
]

const aiItems = [
  { icon: FileText, label: 'Contratos', href: '/contracts', permission: 'use_ai' },
  { icon: Zap, label: 'Facturas IA', href: '/invoices', permission: 'use_ai' },
  { icon: BarChart3, label: 'Reportes', href: '/reports', permission: 'view_audit' },
  { icon: ShieldCheck, label: 'Logs Auditoría', href: '/audit/logs', permission: 'view_audit' },
]


const secondaryItems = [
  { icon: Bell, label: 'Alertas', href: '/alerts', permission: 'view_documents' },
  { icon: Settings, label: 'Configuración', href: '/settings', permission: 'view_audit' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { isOpen, setIsOpen } = useSidebar()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const { hasPermission, role } = useUser()

  // Custom filtering for Vendors
  const isVendor = role === 'PROVEEDOR';
  
  const filteredMenuItems = menuItems.filter(item => {
    if (isVendor) {
      // Vendors only see Dashboard, Documents and optionally Alerts
      return ['Dashboard', 'Documentos'].includes(item.label) && hasPermission(item.permission);
    }
    return hasPermission(item.permission);
  });

  const filteredAIItems = isVendor ? [] : aiItems.filter(item => hasPermission(item.permission))
  const filteredSecondaryItems = secondaryItems.filter(item => {
    if (isVendor && item.label === 'Configuración') return false;
    return hasPermission(item.permission);
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col sidebar-shadow fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm">
            <Zap size={20} className="text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-sidebar-foreground leading-none">Strategic</span>
            <span className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Connex</span>
          </div>
        </div>

        {/* Main Menu */}
        <div className="flex-1 overflow-y-auto px-4 space-y-6 pt-4">
          {filteredMenuItems.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                Módulos
              </p>
              <nav className="space-y-0.5">
                {filteredMenuItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                      )}
                    >
                      <item.icon size={18} className={cn(isActive ? 'text-primary' : 'text-muted-foreground')} />
                      <span className="text-sm">{item.label}</span>
                      {isActive && <ChevronRight size={14} className="ml-auto text-primary" />}
                    </Link>
                  )
                })}
              </nav>
            </div>
          )}

          {filteredAIItems.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                IA & Auditoría
              </p>
              <nav className="space-y-0.5">
                {filteredAIItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                      )}
                    >
                      <item.icon size={18} className={cn(isActive ? 'text-primary' : 'text-muted-foreground')} />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          )}

          {filteredSecondaryItems.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                Sistema
              </p>
              <nav className="space-y-0.5">
                {filteredSecondaryItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                      )}
                    >
                      <item.icon size={18} className={cn(isActive ? 'text-primary' : 'text-muted-foreground')} />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 text-sm text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}
