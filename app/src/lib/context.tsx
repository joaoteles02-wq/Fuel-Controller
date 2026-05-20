'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { vehicles as initialVehicles, refuels as initialRefuels, Vehicle, Refuel } from '@/lib/data';
import { appendRefuelToSheets, getRefuelsFromSheets, deleteRefuelFromSheets } from '@/app/actions/sheets';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  vehicles: Vehicle[];
  refuels: Refuel[];
  selectedVehicleId: string;
  setSelectedVehicleId: (id: string) => void;
  addRefuel: (r: Omit<Refuel, 'id'>) => void;
  deleteRefuel: (id: number) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  addVehicle: (v: Omit<Vehicle, 'id'>) => void;
  isHydrated: boolean;
  syncFromSheets: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [vehicleList, setVehicleList] = useState<Vehicle[]>(initialVehicles);
  const [refuelList, setRefuelList] = useState<Refuel[]>(initialRefuels);
  const [selectedVehicleId, setSelectedVehicleId] = useState('hyundai-i30');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('fc-theme') as 'light' | 'dark' | null;
      if (savedTheme) setTheme(savedTheme);

      const savedAuth = localStorage.getItem('fc-auth');
      if (savedAuth === 'true') setIsAuthenticated(true);

      const savedVehicles = localStorage.getItem('fc-vehicles');
      if (savedVehicles) {
        try { setVehicleList(JSON.parse(savedVehicles)); } catch (e) { console.error(e); }
      }

      const savedRefuels = localStorage.getItem('fc-refuels');
      if (savedRefuels) {
        try { 
          const parsed = JSON.parse(savedRefuels);
          setRefuelList(parsed); 
        } catch (e) { console.error(e); }
      }

      const savedSelected = localStorage.getItem('fc-selected-vehicle');
      if (savedSelected) setSelectedVehicleId(savedSelected);
      
      setIsHydrated(true);
    } catch (err) {
      console.warn("Navegação privada bloqueou LocalStorage, operando em memória.");
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('fc-theme', theme); } catch(e) {}
  }, [theme, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try { localStorage.setItem('fc-vehicles', JSON.stringify(vehicleList)); } catch(e) {}
  }, [vehicleList, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try { localStorage.setItem('fc-refuels', JSON.stringify(refuelList)); } catch(e) {}
  }, [refuelList, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try { localStorage.setItem('fc-selected-vehicle', selectedVehicleId); } catch(e) {}
  }, [selectedVehicleId, isHydrated]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const addRefuel = async (r: Omit<Refuel, 'id'>) => {
    const newId = refuelList.length > 0 ? Math.max(...refuelList.map(x => x.id)) + 1 : 1;
    const newRefuel = { ...r, id: newId };
    setRefuelList(prev => [...prev, newRefuel]);
    
    // Sincroniza com Google Sheets
    console.log('Tentando enviar para o Sheets...', newRefuel);
    try {
      const res = await appendRefuelToSheets(newRefuel);
      if (!res.success) {
        console.error('Falha no Sheets:', res.error);
        alert('Erro ao salvar na planilha: ' + res.error);
      } else {
        console.log('Salvo na planilha com sucesso!');
        // Opcional: alert('Salvo com sucesso na planilha!');
      }
    } catch (e: any) {
      console.error('Erro de rede/servidor no sync:', e);
      alert('Erro de conexão: ' + e.message);
    }
  };

  const deleteRefuel = async (id: number) => {
    const toDelete = refuelList.find(r => r.id === id);
    setRefuelList(prev => prev.filter(r => r.id !== id));

    if (toDelete) {
      // Sincroniza exclusão com o Sheets (baseado em Data e Odômetro)
      try {
        const res = await deleteRefuelFromSheets(toDelete.date, toDelete.odometer);
        if (!res.success) console.warn('Não foi possível deletar na planilha:', res.error);
      } catch (e) {
        console.error('Erro ao deletar no Sheets:', e);
      }
    }
  };

  const login = (pin: string) => {
    // Sempre autenticado
    setIsAuthenticated(true);
    localStorage.setItem('fc-auth', 'true');
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('fc-auth');
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicleList(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const addVehicle = (v: Omit<Vehicle, 'id'>) => {
    const newId = `vehicle-${Date.now()}`;
    setVehicleList(prev => [...prev, { ...v, id: newId }]);
  };

  const syncFromSheets = async () => {
    try {
      const res = await getRefuelsFromSheets();
      if (res.success && res.data) {
        setRefuelList(res.data as any);
        alert('Sincronizado com sucesso! ' + res.data.length + ' registros carregados.');
      } else {
        console.error('Erro ao sincronizar:', res.error);
        alert('Erro ao carregar dados: ' + res.error);
      }
    } catch (e: any) {
      alert('Erro de conexão ao ler planilha: ' + e.message);
    }
  };

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      vehicles: vehicleList,
      refuels: refuelList,
      selectedVehicleId, setSelectedVehicleId,
      addRefuel, deleteRefuel,
      activeTab, setActiveTab,
      isAuthenticated, login, logout,
      updateVehicle, addVehicle,
      isHydrated,
      syncFromSheets,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
