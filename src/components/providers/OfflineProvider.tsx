'use client';

import { useEffect } from 'react';
import SyncProgress from '@/components/offline/SyncProgress';

export default function OfflineProvider() {
  useEffect(() => {
    // Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Setup Sync Logic
    const initSync = async () => {
      try {
        const { createClient } = await import('@/utils/supabase/client');
        const { setupAutoSync } = await import('@/lib/services/offlineSync');
        const supabase = createClient();
        setupAutoSync(supabase);
      } catch (err) {
        console.error('Failed to initialize offline sync:', err);
      }
    };

    initSync();
  }, []);

  return <SyncProgress />;
}
