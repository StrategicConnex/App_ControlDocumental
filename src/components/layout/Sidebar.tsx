'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Wallet, 
  Calendar, 
  Settings, 
  HelpCircle,
  Briefcase,
  ChevronRight,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Employee', href: '/employees' },
  { icon: UserCheck, label: 'Recruitment', href: '/recruitment' },
  { icon: Wallet, label: 'Payroll', href: '/payroll' },
  { icon: Calendar, label: 'Schedule', href: '/schedule' },
]

const departments = [
  { name: 'Business and Marketing', color: 'bg-blue-500' },
  { name: 'Design', color: 'bg-emerald-500' },
  { name: 'Project Manager', color: 'bg-amber-500' },
  { name: 'Human Resource', color: 'bg-purple-500' },
  { name: 'Development', color: 'bg-sky-500' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col sidebar-shadow fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
          B
        </div>
        <span className="font-bold text-xl tracking-tight text-gray-900">Strategic Connex</span>
      </div>

      {/* Profile Summary */}
      <div className="px-4 mb-6">
        <div className="p-3 bg-gray-50 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
            <Briefcase size={20} className="text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">Rocks Company</h4>
            <p className="text-xs text-gray-500 truncate">Team - 20 Members</p>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </div>
      </div>

      {/* Main Menu */}
      <div className="flex-1 overflow-y-auto px-4 space-y-8">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Main Menu</p>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  pathname === item.href 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon size={20} />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Departments */}
        <div>
          <div className="flex items-center justify-between mb-4 px-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Department</p>
            <button className="text-gray-400 hover:text-gray-900 font-bold">+</button>
          </div>
          <div className="space-y-1">
            {departments.map((dept) => (
              <button
                key={dept.name}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                <div className={cn("w-2 h-2 rounded-full", dept.color)} />
                <span className="truncate">{dept.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Other */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Other</p>
          <nav className="space-y-1">
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:text-gray-900">
              <Settings size={20} />
              <span>Setting</span>
            </Link>
            <Link href="/help" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:text-gray-900">
              <HelpCircle size={20} />
              <span>Help Center</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button className="w-full flex items-center gap-3 px-3 py-3 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
