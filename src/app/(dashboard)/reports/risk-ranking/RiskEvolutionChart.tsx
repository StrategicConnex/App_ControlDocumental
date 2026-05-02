'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface RiskEvolutionChartProps {
  history: any[];
}

export default function RiskEvolutionChart({ history }: RiskEvolutionChartProps) {
  // Process data for the chart
  // We need to group by date and calculate average score or show multiple lines
  const chartData = useMemo(() => {
    const grouped = history.reduce((acc: any, curr: any) => {
      const date = new Date(curr.captured_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, totalScore: 0, count: 0 };
      }
      acc[date].totalScore += curr.score;
      acc[date].count += 1;
      return acc;
    }, {});

    return Object.values(grouped).map((g: any) => ({
      date: g.date,
      avgScore: Math.round(g.totalScore / g.count)
    }));
  }, [history]);

  const lastTwo = chartData.slice(-2);
  const trend = lastTwo.length === 2 ? lastTwo[1].avgScore - lastTwo[0].avgScore : 0;

  return (
    <Card className="rounded-[2.5rem] border-gray-100 card-shadow bg-white overflow-hidden">
      <CardHeader className="p-8 pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Activity size={20} className="text-indigo-600" /> Evolución de Salud Documental
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">Promedio de score de todos los proveedores en el tiempo.</p>
        </div>
        {trend !== 0 && (
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend > 0 ? '+' : ''}{trend} pts vs ayer
          </div>
        )}
      </CardHeader>
      <CardContent className="p-8 pt-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8' }} 
                dy={10}
              />
              <YAxis 
                domain={[0, 100]} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8' }}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontSize: '12px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="avgScore" 
                stroke="#4f46e5" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAvg)" 
                name="Score Promedio"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
