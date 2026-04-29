"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  sparklineData?: number[];
  icon?: React.ReactNode;
}

export function MetricCard({ title, value, subtitle, trend, sparklineData, icon }: MetricCardProps) {
  // Simple SVG sparkline generator
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length === 0) return null;
    
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min || 1;
    const width = 100;
    const height = 30;
    const step = width / (sparklineData.length - 1);
    
    const points = sparklineData.map((d, i) => {
      const x = i * step;
      const y = height - ((d - min) / range) * height;
      return `${x},${y}`;
    }).join(" ");

    const colorClass = trend?.isPositive ? "text-emerald-500" : (trend?.isPositive === false ? "text-destructive" : "text-primary");

    return (
      <div className="h-[30px] w-[100px] mt-2">
        <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            className={colorClass}
          />
        </svg>
      </div>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="text-muted-foreground/50">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
            {trend && (
              <p className={cn("text-xs font-medium mt-1 flex items-center gap-1", trend.isPositive ? "text-emerald-500" : "text-destructive")}>
                {trend.isPositive ? "↑" : "↓"} {trend.value}%
                <span className="text-muted-foreground font-normal ml-1">{trend.label}</span>
              </p>
            )}
          </div>
          {renderSparkline()}
        </div>
      </CardContent>
    </Card>
  );
}
