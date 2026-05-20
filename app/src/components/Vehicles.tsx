'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { hapticFeedback } from '@/lib/haptics';
import styles from './Vehicles.module.css';

export default function VehiclesPage() {
  const { vehicles, selectedVehicleId, setSelectedVehicleId, updateVehicle, addVehicle } = useApp();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    plate: '',
    tankLiters: '',
    goalKmPerLiter: '',
    oilChangeKm: '',
    type: 'Carro',
    fuelType: 'flex' as any
  });

  const handleSelect = (id: string) => {
    hapticFeedback('light');
    setSelectedVehicleId(id);
  };

  const startEdit = (v: any) => {
    hapticFeedback('medium');
    setIsEditing(v.id);
    setFormData({
      name: v.name,
      plate: v.plate || '',
      tankLiters: v.tankLiters?.toString() || '50',
      goalKmPerLiter: v.goalKmPerLiter?.toString() || '8',
      oilChangeKm: v.oilChangeKm?.toString() || '0',
      type: v.type || 'Carro',
      fuelType: v.fuelType || 'flex'
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.tankLiters || !formData.goalKmPerLiter) return;

    hapticFeedback('success');
    const vehicleData = {
      name: formData.name,
      plate: formData.plate,
      tankLiters: parseFloat(formData.tankLiters),
      goalKmPerLiter: parseFloat(formData.goalKmPerLiter),
      oilChangeKm: parseInt(formData.oilChangeKm) || 0,
      type: formData.type,
      fuelType: formData.fuelType as any,
      odometer: 0,
      image: '',
      color: 'blue'
    };

    if (isEditing === 'new') {
      addVehicle(vehicleData);
    } else if (isEditing) {
      updateVehicle(isEditing, vehicleData);
    }
    setIsEditing(null);
  };

  const startNew = () => {
    hapticFeedback('medium');
    setIsEditing('new');
    setFormData({
      name: '',
      plate: '',
      tankLiters: '50',
      goalKmPerLiter: '8',
      oilChangeKm: '0',
      type: 'Carro',
      fuelType: 'flex'
    });
  };

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.pageTitle}>Meus Veículos</h1>
      <p className="text-muted">Gerencie seus veículos e defina suas metas de consumo.</p>

      <div className={styles.vehicleList}>
        {vehicles.map((v) => (
          <div key={v.id} className="flex flex-col gap-2">
            <div 
              className={`card ${styles.vehicleCard} ${selectedVehicleId === v.id ? styles.selected : ''}`}
              onClick={() => handleSelect(v.id)}
            >
              <div className={styles.vehicleInfo}>
                <span className={styles.vehicleName}>{v.name}</span>
                <span className={styles.vehicleDetails}>
                  Placa: {v.plate || '—'} • {v.fuelType === 'eletrico' ? 'Bateria:' : 'Tanque:'} <strong className="value-mono">{v.tankLiters}{v.fuelType === 'eletrico' ? 'kWh' : 'L'}</strong>
                </span>
                <span className={styles.vehicleDetails}>
                  Meta: <strong className="value-mono">{v.goalKmPerLiter} {v.fuelType === 'eletrico' ? 'km/kWh' : 'km/L'}</strong> • Óleo: <strong className="value-mono">{v.oilChangeKm} Km</strong>
                </span>
              </div>
              <button 
                className="btn-ghost" 
                onClick={(e) => { e.stopPropagation(); startEdit(v); }}
                style={{minWidth: 'auto', padding: '8px'}}
              >
                Editar
              </button>
            </div>

            {isEditing === v.id && (
              <VehicleForm 
                title="Editar Veículo" 
                formData={formData}
                setFormData={setFormData}
                onSave={handleSave} 
                onCancel={() => setIsEditing(null)} 
              />
            )}
          </div>
        ))}
      </div>

      {isEditing === 'new' ? (
        <VehicleForm 
          title="Novo Veículo" 
          formData={formData}
          setFormData={setFormData}
          onSave={handleSave} 
          onCancel={() => setIsEditing(null)} 
        />
      ) : (
        <button className="btn-primary" onClick={startNew} style={{width:'100%', marginTop:'10px'}}>
          ADICIONAR VEÍCULO
        </button>
      )}

    </div>
  );
}

const VehicleForm = ({ title, formData, setFormData, onSave, onCancel }: any) => (
  <div className="card p-4 flex flex-col gap-4 mt-2" style={{boxShadow: 'inset 2px 2px 5px var(--sd), inset -2px -2px 5px var(--sl)'}}>
    <span className="section-title" style={{fontSize: '0.9rem', marginBottom: 0}}>{title}</span>
    
    <div className="field">
      <label className="label">Nome do Veículo</label>
      <input 
        className="input-neuro" 
        placeholder="Ex: Honda Civic"
        value={formData.name} 
        onChange={e => setFormData({...formData, name: e.target.value})}
      />
    </div>

    <div className="flex gap-4">
      <div className="field flex-1">
        <label className="label">Placa</label>
        <input 
          className="input-neuro" 
          value={formData.plate} 
          maxLength={10}
          placeholder="ABC-1234"
          onChange={e => setFormData({...formData, plate: e.target.value})}
        />
      </div>
      <div className="field flex-1">
        <label className="label">Combustível</label>
        <select 
          className="input-neuro"
          value={formData.fuelType}
          onChange={e => setFormData({...formData, fuelType: e.target.value})}
        >
          <option value="flex">Flex</option>
          <option value="gasolina">Gasolina</option>
          <option value="etanol">Etanol</option>
          <option value="diesel">Diesel</option>
          <option value="gnv">GNV</option>
          <option value="eletrico">Elétrico</option>
        </select>
      </div>
    </div>

    <div className="flex gap-4">
      <div className="field flex-1">
        <label className="label" style={{ whiteSpace: 'nowrap' }}>{formData.fuelType === 'eletrico' ? 'Bateria (kWh)' : 'Tanque (L)'}</label>
        <input 
          type="number" 
          inputMode="decimal"
          className="input-neuro" 
          value={formData.tankLiters} 
          onChange={e => setFormData({...formData, tankLiters: e.target.value})}
        />
      </div>
      <div className="field flex-1">
        <label className="label" style={{ whiteSpace: 'nowrap' }}>Meta ({formData.fuelType === 'eletrico' ? 'km/kWh' : 'km/L'})</label>
        <input 
          type="number" 
          inputMode="decimal"
          className="input-neuro" 
          value={formData.goalKmPerLiter} 
          onChange={e => setFormData({...formData, goalKmPerLiter: e.target.value})}
        />
      </div>
    </div>

    <div className="field">
      <label className="label">Próxima Troca de Óleo (Km)</label>
      <input 
        type="number" 
        inputMode="numeric"
        className="input-neuro" 
        value={formData.oilChangeKm} 
        placeholder="Ex: 80000"
        onChange={e => setFormData({...formData, oilChangeKm: e.target.value})}
      />
    </div>
    <div className="flex gap-2 justify-end mt-2">
      <button className="btn-ghost" onClick={onCancel}>Cancelar</button>
      <button className="btn-primary" onClick={onSave}>SALVAR</button>
    </div>
  </div>
);
