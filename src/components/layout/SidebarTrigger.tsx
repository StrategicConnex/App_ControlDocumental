'use client'

import { Menu, X } from 'lucide-react'
import { useSidebar } from './SidebarProvider'
import { cn } from '@/lib/utils'

export function SidebarTrigger() {
  const { isOpen, toggle } = useSidebar()

  return (
    <button
      onClick={toggle}
      className="lg:hidden p-2 rounded-xl hover:bg-accent transition-colors"
      aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
    >
      {isOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
  )
}
