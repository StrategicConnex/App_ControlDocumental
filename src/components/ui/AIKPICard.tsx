import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface AIKPICardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export default function AIKPICard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: AIKPICardProps) {
  return (
    <div
      className={cn(
        'bg-card p-6 rounded-xl border border-border flex flex-col justify-between h-full group hover:shadow-md transition-all',
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 group-hover:bg-primary/10 transition-colors text-primary">
          {icon}
        </div>
        {trend && (
          <div className={cn(
            'px-2 py-1 rounded-md text-[10px] font-bold',
            trend.isPositive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
          )}>
            {trend.isPositive ? '+' : '-'}{trend.value}%
          </div>
        )}
      </div>
      
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-card-foreground tracking-tighter">{value}</p>
        {description && (
          <p className="text-[10px] text-muted-foreground mt-2 font-medium">{description}</p>
        )}
      </div>
    </div>
  );
}
