'use client';
import { useEffect } from 'react';
import { WasteTracker } from '@/components/waste-tracker';

export default function Home() {
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('✅ PWA install prompt fired!', e);
    });
  }, []);

  return <WasteTracker />;
}