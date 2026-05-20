'use client';

import { useApp } from '@/lib/context';
import { hapticFeedback } from '@/lib/haptics';
import styles from './NavBar.module.css';

const tabs = [
  { id: 'dashboard', label: 'Home' },
  { id: 'history',   label: 'Histórico' },
  { id: 'new',       label: 'Add' },
  { id: 'reports',   label: 'Stats' },
  { id: 'vehicles',  label: 'Veículos' },
];

const TabIcon = ({ id, active }: { id: string; active: boolean }) => {
  const color = active ? 'var(--accent)' : 'var(--text-2)';
  
  if (id === 'dashboard') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  );
  if (id === 'history') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
  );
  if (id === 'reports') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
  );
  if (id === 'new') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  );
  if (id === 'vehicles') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="10" width="22" height="8" rx="2"/><path d="M7 10l.5-4h9l.5 4"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
  );
  return null;
};

export default function NavBar() {
  const { activeTab, setActiveTab } = useApp();

  const handleTabChange = (tabId: string) => {
    hapticFeedback('light');
    setActiveTab(tabId);
  };

  return (
    <nav className={styles.nav} role="navigation" aria-label="Navegação principal">
      {tabs.map(tab => (
        <button
          key={tab.id}
          id={`nav-${tab.id}`}
          className={`${styles.navBtn} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => handleTabChange(tab.id)}
          aria-label={tab.label}
          aria-current={activeTab === tab.id ? 'page' : undefined}
        >
          {tab.id === 'new' ? (
            <div className={styles.addIcon}>
              <TabIcon id="new" active={true} />
            </div>
          ) : (
            <>
              <div className={styles.navIcon}>
                <TabIcon id={tab.id} active={activeTab === tab.id} />
              </div>
              <span className={styles.navLabel}>{tab.label}</span>
            </>
          )}
        </button>
      ))}
    </nav>
  );
}
