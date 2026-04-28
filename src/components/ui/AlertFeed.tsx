import Link from 'next/link'
import { FileText, Users, Truck, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type AlertType = 'document' | 'personnel' | 'vehicle'

export interface AlertItem {
  id: string
  type: AlertType
  title: string
  status: string
  link: string
}

const typeIcons: Record<AlertType, React.ElementType> = {
  document: FileText,
  personnel: Users,
  vehicle: Truck,
}

function isHighSeverity(status: string) {
  return status === 'vencido' || status === 'bloqueado'
}

interface AlertFeedProps {
  alerts: AlertItem[]
  maxItems?: number
  emptyMessage?: string
}

export default function AlertFeed({
  alerts,
  maxItems = 5,
  emptyMessage = 'Sin alertas activas',
}: AlertFeedProps) {
  const displayed = alerts.slice(0, maxItems)

  if (displayed.length === 0) {
    return (
      <div className="text-center py-10">
        <CheckCircle2 size={48} className="mx-auto text-emerald-200 mb-3" />
        <p className="text-sm font-medium text-gray-900">Todo en orden</p>
        <p className="text-xs text-gray-400 mt-1">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {displayed.map((alert) => {
        const Icon = typeIcons[alert.type]
        const high = isHighSeverity(alert.status)

        return (
          <Link key={alert.id} href={alert.link} className="block group">
            <div className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  high ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                )}
              >
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                  {alert.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 capitalize">
                  Estado:{' '}
                  <span className={cn('font-medium', high ? 'text-rose-600' : 'text-amber-600')}>
                    {alert.status.replace(/_/g, ' ')}
                  </span>
                </p>
              </div>
              <span className="shrink-0 text-xs text-gray-400 self-center">Acción Req.</span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
