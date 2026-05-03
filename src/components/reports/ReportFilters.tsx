'use client';

import React from 'react';
import { Filter, Calendar, Search, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterState } from '@/hooks/useFilters';

interface ReportFiltersProps {
  filters: FilterState;
  onUpdate: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  showCategory?: boolean;
  categories?: string[];
  statuses?: string[];
  advanced?: React.ReactNode;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onUpdate,
  onReset,
  showCategory,
  categories = [],
  statuses = ['active', 'inactive', 'pending'],
  advanced
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false);

  return (
    <div className="bg-slate-50/50 rounded-xl border p-4 space-y-4 mb-6 transition-all duration-300">
      {/* Sticky/Quick Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, nombre o descripción..."
            className="pl-9 bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
            value={filters.search || ''}
            onChange={(e) => onUpdate({ search: e.target.value })}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              type="date"
              className="w-[160px] bg-white border-slate-200"
              value={filters.startDate || ''}
              onChange={(e) => onUpdate({ startDate: e.target.value })}
            />
          </div>
          <span className="text-slate-400 font-medium">→</span>
          <div className="relative">
            <Input
              type="date"
              className="w-[160px] bg-white border-slate-200"
              value={filters.endDate || ''}
              onChange={(e) => onUpdate({ endDate: e.target.value })}
            />
          </div>
        </div>

        <Select
          value={filters.status || 'all'}
          onValueChange={(val) => onUpdate({ status: val === 'all' ? undefined : val })}
        >
          <SelectTrigger className="w-[160px] bg-white border-slate-200">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los Estados</SelectItem>
            {statuses.map(s => (
              <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showCategory && (
          <Select
            value={filters.category || 'all'}
            onValueChange={(val) => onUpdate({ category: val === 'all' ? undefined : val })}
          >
            <SelectTrigger className="w-[180px] bg-white border-slate-200">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las Categorías</SelectItem>
              {categories.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-indigo-600"
            onClick={onReset}
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Limpiar
          </Button>
          
          {advanced && (
            <Button
              variant="outline"
              size="sm"
              className="border-slate-200 text-slate-700"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            >
              <Filter className="h-4 w-4 mr-1.5" />
              Filtros Avanzados
              {isAdvancedOpen ? <ChevronUp className="h-4 w-4 ml-1.5" /> : <ChevronDown className="h-4 w-4 ml-1.5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Panel */}
      {isAdvancedOpen && advanced && (
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {advanced}
        </div>
      )}
    </div>
  );
};
