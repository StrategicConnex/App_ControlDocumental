import { cn } from '@/lib/utils'

type StatusVariant =
  | 'vigente'
  | 'aprobado'
  | 'por_vencer'
  | 'vencido'
  | 'bloqueado'
  | 'borrador'
  | 'revision'
  | 'enviado'
  | 'aceptado'
  | 'rechazado'
  | string

const variantMap: Record<string, { bg: string; text: string; label?: string }> = {
  vigente:    { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  aprobado:   { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  aceptado:   { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  por_vencer: { bg: 'bg-amber-50',   text: 'text-amber-700',  label: 'Por Vencer' },
  enviado:    { bg: 'bg-amber-50',   text: 'text-amber-700' },
  revision:   { bg: 'bg-blue-50',    text: 'text-blue-700' },
  vencido:    { bg: 'bg-rose-50',    text: 'text-rose-700' },
  bloqueado:  { bg: 'bg-rose-50',    text: 'text-rose-700' },
  rechazado:  { bg: 'bg-rose-50',    text: 'text-rose-700' },
  borrador:   { bg: 'bg-gray-100',   text: 'text-gray-600' },
}

interface StatusBadgeProps {
  status: StatusVariant
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = variantMap[status] ?? { bg: 'bg-gray-100', text: 'text-gray-600' }
  const display = config.label ?? status.replace(/_/g, ' ')

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize',
        config.bg,
        config.text,
        className
      )}
    >
      {display}
    </span>
  )
}
