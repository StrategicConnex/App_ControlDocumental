'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { globalSearch, SearchResult } from '@/lib/services/search';
import {
  Search, FileText, Users, Truck, TrendingUp, FolderOpen,
  X, Loader2, Command
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ─── Icon map by module ───────────────────────────────────────────────────────
const MODULE_CONFIG: Record<SearchResult['module'], {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
}> = {
  document: { icon: FileText,    label: 'Documentos', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  legajo:   { icon: FolderOpen,  label: 'Legajos',    color: 'text-purple-600', bg: 'bg-purple-50' },
  personnel:{ icon: Users,       label: 'Personal',   color: 'text-blue-600',   bg: 'bg-blue-50'   },
  vehicle:  { icon: Truck,       label: 'Flota',      color: 'text-amber-600',  bg: 'bg-amber-50'  },
  budget:   { icon: TrendingUp,  label: 'Presupuestos',color: 'text-emerald-600',bg: 'bg-emerald-50'},
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function GlobalSearch() {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);

  const inputRef     = useRef<HTMLInputElement>(null);
  const supabase     = createClient();

  // ── Keyboard shortcut Ctrl+K / Cmd+K ────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else { setQuery(''); setResults([]); setSelected(0); }
  }, [open]);

  // ── Debounced search ─────────────────────────────────────────────────────────
  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const data = await globalSearch(supabase, q);
      setResults(data);
      setSelected(0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  // ── Keyboard navigation ──────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && results[selected]) {
      window.location.href = results[selected].href;
      setOpen(false);
    }
  };

  if (!open) {
    return (
      <button
        id="global-search-trigger"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm text-gray-500 transition-colors"
      >
        <Search size={15} />
        <span className="hidden md:inline">Buscar...</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono text-gray-400">
          <Command size={9} />K
        </kbd>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className="fixed top-[10vh] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">

          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            {loading
              ? <Loader2 size={18} className="text-gray-400 shrink-0 animate-spin" />
              : <Search size={18} className="text-gray-400 shrink-0" />
            }
            <input
              ref={inputRef}
              id="global-search-input"
              type="text"
              placeholder="Buscar documentos, personal, vehículos, legajos..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
            />
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <ul className="py-2 max-h-[60vh] overflow-y-auto divide-y divide-gray-50">
              {results.map((r, i) => {
                const cfg = MODULE_CONFIG[r.module];
                const Icon = cfg.icon;
                return (
                  <li key={`${r.module}-${r.id}`}>
                    <Link
                      href={r.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 transition-colors',
                        i === selected ? 'bg-indigo-50' : 'hover:bg-gray-50'
                      )}
                    >
                      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', cfg.bg, cfg.color)}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p>
                        {r.subtitle && <p className="text-xs text-gray-500 truncate">{r.subtitle}</p>}
                      </div>
                      <span className="text-xs text-gray-400 shrink-0 capitalize">{cfg.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Empty state */}
          {query.length >= 2 && !loading && results.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-400">
              Sin resultados para <span className="font-medium text-gray-600">&quot;{query}&quot;</span>
            </div>
          )}

          {/* Hints */}
          {query.length < 2 && !loading && (
            <div className="px-4 py-3 text-xs text-gray-400 flex items-center gap-4">
              <span>↑↓ navegar</span>
              <span>↵ abrir</span>
              <span>Esc cerrar</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
