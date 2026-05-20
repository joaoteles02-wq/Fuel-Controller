'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import ThemeToggle from './ThemeToggle';
import { hapticFeedback } from '@/lib/haptics';
import styles from './ThemeToggle.module.css';

async function clearPWACache() {
  if (!('caches' in window)) return;
  const keys = await caches.keys();
  await Promise.all(keys.map(k => caches.delete(k)));

  // Desregistra o service worker para forçar nova instalação
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(r => r.unregister()));
  }

  window.location.reload();
}

export default function HeaderActions() {
  const { logout, isAuthenticated, syncFromSheets } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleLogout = () => {
    hapticFeedback('medium');
    logout();
  };

  const handleClearCache = () => {
    hapticFeedback('medium');
    clearPWACache();
  };

  const handleSync = async () => {
    hapticFeedback('heavy');
    setIsSyncing(true);
    try {
      await syncFromSheets();
      alert('Sincronizado com Google Sheets!');
    } catch (e) {
      alert('Erro ao sincronizar');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isAuthenticated) return <ThemeToggle />;

  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <button
        onClick={handleSync}
        className={`${styles.toggle} ${isSyncing ? 'animate-pulse opacity-50' : ''}`}
        title="Sincronizar com Google Sheets"
        disabled={isSyncing}
      >
        <span className={styles.icon}>{isSyncing ? '⌛' : '☁️'}</span>
      </button>
      <button
        onClick={handleClearCache}
        className={styles.toggle}
        title="Limpar cache / Atualizar app"
        aria-label="Limpar cache e recarregar aplicativo"
      >
        <span className={styles.icon}>🔄</span>
      </button>
      <button 
        onClick={handleLogout}
        className={styles.toggle}
        title="Sair / Logout"
        aria-label="Encerrar sessão"
      >
        <span className={styles.icon}>🚪</span>
      </button>
    </div>
  );
}
