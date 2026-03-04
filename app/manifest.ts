import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EcoTrack - Urban Waste Management',
    short_name: 'EcoTrack',
    description: 'Track and manage your urban waste and recycling habits',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#10b981',
    icons: [
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],screenshots: [
  {
    src: '/screenshot-wide.png',
    sizes: '1280x720',
    type: 'image/png',
    form_factor: 'wide',        // 👈 for desktop
  },
  {
    src: '/screenshot-mobile.png',
    sizes: '540x960',
    type: 'image/png',
    form_factor: 'narrow',      // 👈 for mobile
  },
],
  };
}