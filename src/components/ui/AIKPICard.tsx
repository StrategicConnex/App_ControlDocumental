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
        'bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 flex flex-col justify-between h-full group hover:border-white/20 transition-all',
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-xl border border-white/5 group-hover:bg-white/10 transition-colors">
          {icon}
        </div>
        {trend && (
          <div className={cn(
            'px-2 py-1 rounded-md text-[10px] font-bold',
            trend.isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          )}>
            {trend.isPositive ? '+' : '-'}{trend.value}%
          </div>
        )}
      </div>
      
      <div>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{title}</p>
        <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
        {description && (
          <p className="text-[10px] text-gray-500 mt-2 font-medium">{description}</p>
        )}
      </div>
    </div>
  );
}
