import type { Metadata, Viewport } from 'next';
import { AppProvider } from '@/lib/context';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Fuel Controller — Controle de Abastecimento',
  description: 'App mobile-first para controle de abastecimento e consumo de combustível. Acompanhe gastos, km/L e histórico do seu veículo.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Fuel Controller',
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#8d7144' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/app_icon.png" />
      </head>
      <body suppressHydrationWarning>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
