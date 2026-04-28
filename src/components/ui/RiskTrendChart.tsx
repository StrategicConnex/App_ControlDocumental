'use client';

import { useMemo } from 'react';

interface DataPoint {
  recorded_at: string;
  score: number;
}

export default function RiskTrendChart({ data }: { data: DataPoint[] }) {
  const points = useMemo(() => {
    if (!data.length) return '';
    
    const width = 300;
    const height = 100;
    const max = 100;
    
    const xStep = width / (data.length - 1 || 1);
    
    return data.map((d, i) => {
      const x = i * xStep;
      const y = height - (d.score / max) * height;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }, [data]);

  const areaPoints = useMemo(() => {
    if (!data.length) return '';
    const width = 300;
    const height = 100;
    const p = points;
    return `${p} L 300 100 L 0 100 Z`;
  }, [data, points]);

  if (!data.length) {
    return (
      <div className="h-24 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <p className="text-[10px] text-gray-400 font-medium">Sin datos históricos suficientes</p>
      </div>
    );
  }

  return (
    <div className="relative h-24 w-full">
      <svg
        viewBox="0 0 300 100"
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <path
          d={areaPoints}
          fill="url(#chartGradient)"
        />
        
        {/* Line */}
        <path
          d={points}
          fill="none"
          stroke="#7c3aed"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-lg"
        />
        
        {/* Dots */}
        {data.map((d, i) => {
          const x = i * (300 / (data.length - 1 || 1));
          const y = 100 - (d.score / 100) * 100;
          if (i === 0 || i === data.length - 1 || i % 5 === 0) {
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill="#7c3aed"
                stroke="white"
                strokeWidth="1.5"
              />
            );
          }
          return null;
        })}
      </svg>
      
      <div className="flex justify-between mt-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Hace 30 días</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Hoy</span>
      </div>
    </div>
  );
}
