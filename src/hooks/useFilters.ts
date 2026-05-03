'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export interface FilterState {
  startDate?: string;
  endDate?: string;
  status?: string;
  category?: string;
  search?: string;
  [key: string]: string | undefined;
}

export function useFilters(initialFilters: FilterState = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Load filters from URL on mount
  const [filters, setFilters] = useState<FilterState>(() => {
    const params: FilterState = { ...initialFilters };
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  });

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      
      // Remove undefined/empty values
      const cleanFilters: FilterState = {};
      Object.entries(updated).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          cleanFilters[key] = value;
        }
      });

      // Sync with URL
      const params = new URLSearchParams();
      Object.entries(cleanFilters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
      
      return cleanFilters;
    });
  }, [pathname, router]);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    router.replace(pathname, { scroll: false });
  }, [initialFilters, pathname, router]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const params: FilterState = { ...initialFilters };
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    setFilters(params);
  }, [searchParams, initialFilters]);

  return { filters, updateFilters, resetFilters };
}
