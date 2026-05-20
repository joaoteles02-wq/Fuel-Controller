'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { Refuel } from '@/lib/data';
import { QrCode } from 'lucide-react';
import QRScanner from './QRScanner';
import styles from './NewRefuel.module.css';

const today = new Date().toISOString().split('T')[0];

export default function NewRefuel() {
  const { vehicles, refuels, addRefuel, setActiveTab, selectedVehicleId } = useApp();
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    const magicData = sessionStorage.getItem('magic-refuel-data');
    if (magicData) {
      try {
        const parsed = JSON.parse(magicData);
        setForm(f => ({
          ...f,
          odometer: parsed.odometer || f.odometer,
          total: parsed.total || f.total,
          fuelSupplied: parsed.liters || f.fuelSupplied,
          gasStation: parsed.gasStation || f.gasStation,
          nfeLink: parsed.nfeLink || f.nfeLink,
        }));
      } catch (e) {}
      sessionStorage.removeItem('magic-refuel-data');
    }
  }, []);

  const lastOdo = refuels
    .filter(r => r.vehicleId === selectedVehicleId)
    .sort((a, b) => b.odometer - a.odometer)[0]?.odometer ?? 0;

  const uniqueStations = Array.from(new Set(refuels.map(r => r.gasStation).filter(Boolean))).sort();

  const [form, setForm] = useState({
    vehicleId:    selectedVehicleId,
    date:         today,
    gasStation:   '',
    fuelSupplied: '',
    total:        '',
    unitValue:    '',
    odometer:     '',
    tankLevel:    '',
    driveType:    'City',
    note:         '',
    nfeLink:      '',
  });
  const [saved, setSaved] = useState(false);

  const unitValue = form.total && form.fuelSupplied && parseFloat(form.fuelSupplied) > 0
    ? (parseFloat(form.total) / parseFloat(form.fuelSupplied)).toFixed(2)
    : '';

  const prevOdo = refuels
    .filter(r => r.vehicleId === form.vehicleId)
    .sort((a, b) => b.odometer - a.odometer)[0]?.odometer ?? 0;

  const distance = form.odometer && prevOdo
    ? Math.max(0, parseInt(form.odometer) - prevOdo)
    : 0;

  const consumption = distance > 0 && form.fuelSupplied
    ? (distance / parseFloat(form.fuelSupplied)).toFixed(2)
    : '';

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleScan = async (link: string) => {
    set('nfeLink', link);
    setShowScanner(false);

    try {
      // 1. Tenta extrair da URL via Regex (mais rápido)
      const url = new URL(link);
      const vNF = url.searchParams.get('vNF'); // Valor Nota Fiscal
      const qIt = url.searchParams.get('qIt'); // Quantidade Itens (às vezes litros se for item único)
      
      if (vNF) {
        set('total', vNF);
        console.log('Valor extraído da URL:', vNF);
      }

      // 2. Chama a Server Action para processamento profundo (XML/HTML)
      const { parseNfeData } = await import('@/app/actions/nfe');
      const result = await parseNfeData(link);
      
      if (result.success && result.parsed) {
        // Exemplo de mapeamento para estrutura XML da NF-e
        const infNFe = result.parsed.nfeProc?.NFe?.[0]?.infNFe?.[0];
        const totalVal = infNFe?.total?.[0]?.ICMSTot?.[0]?.vNF?.[0];
        
        if (totalVal) {
          set('total', totalVal);
          console.log('Valor extraído do XML:', totalVal);
        }

        // Tenta pegar o posto
        const xNome = infNFe?.emit?.[0]?.xNome?.[0];
        if (xNome) set('gasStation', xNome);
      }
    } catch (e) {
      console.warn('Não foi possível extrair dados automáticos da NF-e:', e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.odometer || !form.fuelSupplied || !form.total || !form.tankLevel) {
      if (!form.tankLevel) alert("Por favor, selecione o Nível do Tanque.");
      return;
    }

    // Extract nfeKey from the link so it's saved locally
    let nfeKey = '';
    if (form.nfeLink) {
      const noSpaces = form.nfeLink.replace(/\s+/g, '');
      const keyMatch = noSpaces.match(/\d{44}/);
      if (keyMatch) nfeKey = keyMatch[0];
    }

    const vehicle = vehicles.find(v => v.id === form.vehicleId);
    const newRefuel: Omit<Refuel, 'id'> = {
      vehicleId:    form.vehicleId,
      date:         form.date,
      odometer:     parseInt(form.odometer),
      distance,
      driveType:    form.driveType,
      spentFuel:    parseFloat(form.fuelSupplied) - (vehicle?.tankLiters ?? 53 - parseFloat(form.fuelSupplied)),
      tankCapacity: vehicle?.tankLiters ?? 53,
      fuelSupplied: parseFloat(form.fuelSupplied),
      gasStation:   form.gasStation,
      total:        parseFloat(form.total),
      unitValue:    parseFloat(unitValue),
      consumption:  parseFloat(consumption || '0'),
      tankLevel:    form.tankLevel,
      periodDays:   0,
      photoBill:    form.nfeLink,
      nfeKey:       nfeKey,
    };

    addRefuel(newRefuel);
    setSaved(true);
    // Limpa os campos, em especial o odômetro
    setForm(f => ({ ...f, odometer: '', fuelSupplied: '', total: '', tankLevel: '', gasStation: '', nfeLink: '' }));
    setTimeout(() => {
      setSaved(false);
      setActiveTab('dashboard');
    }, 1500);
  };

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.pageTitle}>Novo Abastecimento</h1>

      {saved && (
        <div className={styles.successBanner}>
          Abastecimento salvo!
        </div>
      )}

      {showScanner && (
        <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>

        {/* Veículo */}
        <div className={styles.field}>
          <label className="label" htmlFor="field-vehicle">Veículo</label>
          <select
            id="field-vehicle"
            className="input-neuro"
            value={form.vehicleId}
            onChange={e => set('vehicleId', e.target.value)}
          >
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>



        {/* Data */}
        <div className={styles.field}>
          <label className="label" htmlFor="field-date">Data</label>
          <input
            id="field-date"
            type="date"
            className="input-neuro"
            value={form.date}
            onChange={e => set('date', e.target.value)}
            required
          />
        </div>

        {/* Odômetro */}
        <div className={styles.field}>
          <label className="label" htmlFor="field-odo">Odômetro (km)</label>
          <input
            id="field-odo"
            type="number"
            inputMode="numeric"
            className="input-neuro"
            placeholder={`Último: ${lastOdo.toLocaleString('pt-BR')} km`}
            min={prevOdo}
            value={form.odometer}
            onChange={e => set('odometer', e.target.value)}
            required
          />
          {distance > 0 && (
            <span className={styles.hint}>Distância: {distance} km • {consumption ? `${consumption} km/L` : ''}</span>
          )}
        </div>

        {/* Tipo de percurso rmeovido, era aqui */}

        {/* Posto */}
        <div className={styles.field}>
          <label className="label" htmlFor="field-station">Posto</label>
          <input
            id="field-station"
            type="text"
            list="stations-list"
            className="input-neuro"
            placeholder="Ex: P V Rao 2"
            value={form.gasStation}
            onChange={e => set('gasStation', e.target.value)}
            autoComplete="off"
          />
          <datalist id="stations-list">
            {uniqueStations.map(s => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        {/* Litros */}
        <div className={styles.field}>
          <label className="label" htmlFor="field-liters">Litros abastecidos</label>
          <input
            id="field-liters"
            type="number"
            inputMode="decimal"
            className="input-neuro"
            placeholder="Ex: 35.50"
            step="0.01"
            min="0"
            value={form.fuelSupplied}
            onChange={e => set('fuelSupplied', e.target.value)}
            onFocus={(e) => {
              if (!form.odometer) {
                alert("Por favor, preencha a quilometragem primeiro!");
                e.currentTarget.blur();
              }
            }}
            readOnly={!form.odometer}
            required
          />
        </div>

        {/* Nível */}
        <div className={styles.field}>
          <label className="label">Nível do tanque</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={form.tankLevel === 'Full Tank' ? 'btn-primary' : 'btn-secondary'}
              style={{ flex: 1 }}
              onClick={() => set('tankLevel', 'Full Tank')}
            >
              Tanque Cheio
            </button>
            <button
              type="button"
              className={form.tankLevel === 'Parcial' ? 'btn-primary' : 'btn-secondary'}
              style={{ flex: 1 }}
              onClick={() => set('tankLevel', 'Parcial')}
            >
              Parcial
            </button>
          </div>
        </div>

        {/* Total (R$) */}
        <div className={styles.field}>
          <label className="label" htmlFor="field-total">Total (R$)</label>
          <input
            id="field-total"
            type="number"
            inputMode="decimal"
            className="input-neuro"
            placeholder="Ex: 150.00"
            step="0.01"
            min="0"
            value={form.total}
            onChange={e => set('total', e.target.value)}
            onFocus={(e) => {
              if (!form.tankLevel) {
                alert("Por favor, preencha o Nivel do tanque antes!");
                e.currentTarget.blur();
              }
            }}
            readOnly={!form.tankLevel}
            required
          />
        </div>

        {/* Preço/L */}
        <div className={styles.field}>
          <label className="label">Preço por litro (R$)</label>
          <div className={`input-neuro ${styles.autoField}`}>
            {unitValue ? `R$ ${parseFloat(unitValue).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : '—'}
          </div>
        </div>

        {/* Scanner Button — abaixo do Preço/L */}
        <div className={styles.field} style={{ marginBottom: '32px' }}>
          <button
            type="button"
            className="btn-secondary"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '20px 16px',
              fontSize: '1.1rem',
              fontWeight: 800,
              letterSpacing: '0.5px',
              background: form.nfeLink ? 'rgba(39,174,96,0.2)' : 'rgba(59, 130, 246, 0.15)',
              border: form.nfeLink ? '2px solid #27ae60' : '1px solid rgba(59, 130, 246, 0.4)',
              color: form.nfeLink ? '#27ae60' : '#4dabff'
            }}
            onClick={() => setShowScanner(true)}
          >
            {form.nfeLink ? (
              <>✅ QR CAPTURADO</>
            ) : (
              <><QrCode size={20} /> Scanner QR</>
            )}
          </button>
          {form.nfeLink && (
            <div style={{ 
              marginTop: '12px', 
              padding: '12px', 
              background: 'rgba(0,0,0,0.2)', 
              borderRadius: '10px',
              border: '1px dashed rgba(39,174,96,0.5)'
            }}>
              <p style={{ fontSize: '0.75rem', color: '#5ecc8a', fontWeight: 600, marginBottom: '4px' }}>
                Link da NF-e capturado:
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-2)', wordBreak: 'break-all', opacity: 0.8 }}>
                {form.nfeLink}
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <button
            type="button"
            className="btn-secondary"
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)' }}
            onClick={() => {
              setForm(f => ({ ...f, odometer: '', fuelSupplied: '', total: '', tankLevel: '', gasStation: '', nfeLink: '' }));
              setActiveTab('dashboard');
            }}
          >
            CANCELAR
          </button>
          <button
            id="btn-save-refuel"
            type="submit"
            className={`btn-primary ${styles.saveBtn}`}
            style={{ flex: 1, margin: 0 }}
          >
            SALVAR
          </button>
        </div>

      </form>
    </div>
  );
}
