'use client';

import { useApp } from '@/lib/context';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useApp();

  return (
    <button
      id="theme-toggle"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
      title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
    >
      <span className={styles.icon}>{theme === 'light' ? '🌙' : '☀️'}</span>
    </button>
  );
}
