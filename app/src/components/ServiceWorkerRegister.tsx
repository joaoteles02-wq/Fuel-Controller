'use client';
import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const isProduction =
        typeof window !== 'undefined' &&
        window.location.protocol === 'https:' &&
        !window.location.hostname.includes('localhost') &&
        !window.location.hostname.match(/^(\d{1,3}\.){3}\d{1,3}$/);

      if (isProduction) {
        // Produção (Vercel): registra o SW normalmente
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').catch(err => {
            console.warn('Service Worker registration failed:', err);
          });
        });
      } else {
        // Dev (localhost / IP local): remove qualquer SW antigo para não bloquear atualizações
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(r => r.unregister());
        });
      }
    }
  }, []);

  return null;
}
