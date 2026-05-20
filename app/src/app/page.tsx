'use client';
import { useEffect } from 'react';

import { useApp } from '@/lib/context';
import Dashboard from '@/components/Dashboard';
import NewRefuel from '@/components/NewRefuel';
import Reports from '@/components/Reports';
import HistoryPage from '@/components/HistoryPage';
import VehiclesPage from '@/components/Vehicles';
import NavBar from '@/components/NavBar';
import HeaderActions from '@/components/HeaderActions';
import Login from '@/components/Login';
import styles from './page.module.css';

export default function Home() {
  const { activeTab, isAuthenticated } = useApp();

  // if (!isAuthenticated) return <Login />;

  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerBrand}>
            <span className={styles.headerTitle}>FUEL CONTROLLER</span>
          </div>
          <HeaderActions />
        </div>
      </header>

      <main className={styles.main}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'history'   && <HistoryPage />}
        {activeTab === 'new'       && <NewRefuel />}
        {activeTab === 'reports'   && <Reports />}
        {activeTab === 'vehicles'  && <VehiclesPage />}
      </main>

      <NavBar />
    </div>
  );
}
