import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple'
  className?: string
}

const colorMap = {
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'text-indigo-600',
    value: 'text-gray-900',
  },
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    value: 'text-gray-900',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    value: 'text-gray-900',
  },
  rose: {
    bg: 'bg-rose-50',
    icon: 'text-rose-600',
    value: 'text-gray-900',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    value: 'text-gray-900',
  },
}

export default function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  className,
}: KPICardProps) {
  const colors = colorMap[color]

  return (
    <div
      className={cn(
        'bg-white p-6 rounded-[2rem] card-shadow border border-gray-100 flex items-center gap-4',
        className
      )}
    >
      <div
        className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0',
          colors.bg
        )}
      >
        <Icon size={28} className={colors.icon} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 font-medium truncate">{title}</p>
        <p className={cn('text-3xl font-bold leading-tight', colors.value)}>{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
