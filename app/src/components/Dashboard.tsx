'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { Camera } from 'lucide-react';
import {
  getMonthlyTotal, getAverageConsumption, getTotalRefuels,
  getCostPerKm, getLast6MonthsData, formatCurrency, formatDate,
  getTotalKm, getTotalFuelConsumed,
} from '@/lib/data';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { refuels, selectedVehicleId, vehicles, setActiveTab } = useApp();
  const vehicle = vehicles.find(v => v.id === selectedVehicleId);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const vId = selectedVehicleId;

  const monthlyTotal        = getMonthlyTotal(refuels, vId);
  const avgConsumption     = getAverageConsumption(refuels, vId);
  const totalKm            = getTotalKm(refuels, vId);
  const totalFuelConsumed  = getTotalFuelConsumed(refuels, vId);
  const costPerKm          = getCostPerKm(refuels, vId);
  const chartData          = getLast6MonthsData(refuels, vId);

  const lastRefuels = refuels
    .filter(r => r.vehicleId === vId)
    .sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return b.id - a.id;
    })
    .slice(0, 5);

  const lastRefuel = lastRefuels[0];
  const lastRefuelOdo = Number(lastRefuel?.odometer) || 0;

  // ── HOOKS primeiro (regra do React) ─────────────────────────────────────────
  // Odômetro simulado: usa sessionStorage → temporário, limpa ao fechar o app
  // Nunca persiste no contexto global para não contaminar os dados reais
  const sessionKey = `fc-sim-odo-${vId}`;

  const [odoValue, setOdoValue] = useState<string>(() => {
    // Restaura da sessão ativa; se não houver, usa odômetro do último abastecimento
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(sessionKey);
      if (saved) return saved;
    }
    return lastRefuelOdo.toString();
  });

  // Ao trocar de veículo ou atualizar os dados, reseta o odômetro para o último histórico SE não tiver sessão ativa
  useEffect(() => {
    const saved = sessionStorage.getItem(sessionKey);
    if (!saved && lastRefuelOdo > 0) {
      setOdoValue(lastRefuelOdo.toString());
    }
  }, [vId, lastRefuelOdo]);

  const handleOdoChange = (val: string) => {
    const onlyNums = val.replace(/[^0-9]/g, '');
    setOdoValue(onlyNums);
    if (typeof window !== 'undefined') {
      if (onlyNums.length > 0) {
        sessionStorage.setItem(sessionKey, onlyNums);
      } else {
        sessionStorage.removeItem(sessionKey);
      }
    }
  };

  const resetOdo = () => {
    if (typeof window !== 'undefined') sessionStorage.removeItem(sessionKey);
    setOdoValue(lastRefuelOdo.toString());
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzing(true);
    try {
      const base64Str = await compressImage(file);
      const base64Data = base64Str.split(',')[1];
      const { parseReceiptFromImage } = await import('@/app/actions/receipt');
      const res = await parseReceiptFromImage(base64Data, 'image/jpeg');
      
      if (res.success && res.data) {
        sessionStorage.setItem('magic-refuel-data', JSON.stringify({
          odometer: odoValue || lastRefuelOdo.toString(),
          total: res.data.total?.toString() || '',
          liters: res.data.liters?.toString() || '',
          gasStation: res.data.gasStation || '',
          nfeLink: res.data.nfeLink || ''
        }));
        setActiveTab('new');
      } else {
        alert('A IA não conseguiu analisar a imagem. Erro: ' + (res.error || 'Desconhecido'));
      }
    } catch (err: any) {
      alert('Falha na comunicação com o servidor: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Cálculos derivados (usam odoValue) ──────────────────────────────────────
  const currentSimOdo = Number(odoValue) || lastRefuelOdo;
  const kmSinceLastRefuel = Math.max(0, currentSimOdo - lastRefuelOdo);

  // Fórmulas aplicadas conforme solicitação
  const kmAnterior = Number(lastRefuel?.consumption) || 0;
  const kmMedio = avgConsumption || 0;

  const estimatedFuelConsumed = (lastRefuel?.tankLevel === 'Full Tank')
    ? (kmAnterior > 0 ? kmSinceLastRefuel / kmAnterior : 0)
    : (kmMedio > 0 ? kmSinceLastRefuel / kmMedio : 0);

  const fuelSupplied = Number(lastRefuel?.fuelSupplied) || 0;
  const currentKmL = (kmSinceLastRefuel > 0 && fuelSupplied > 0)
    ? (kmSinceLastRefuel / fuelSupplied)
    : 0;

  const tankCapacity = Number(vehicle?.tankLiters) || 53;
  const isEV = vehicle?.fuelType === 'eletrico';

  // Cálculos base do tanque e bateria (Fórmulas Novas)
  // O usuário solicitou que a simulação sempre parta do tanque cheio (tankCapacity) no último abastecimento.
  const startLiters = tankCapacity;

  const currentTankLiters = Math.max(0, startLiters - estimatedFuelConsumed);

  const bateriaPercent = tankCapacity > 0 ? (currentTankLiters / tankCapacity) * 100 : 0;

  // Variáveis dinâmicas de exibição
  const currentTankValue = isEV ? Math.max(0, bateriaPercent) : currentTankLiters;
  const maxTankValue = isEV ? 100 : tankCapacity;
  const labelTank = isEV ? 'Bateria (%)' : 'Tanque (L)';
  const unitTank = isEV ? '%' : 'L';
  const labelConsumed = isEV ? 'Energia Consumida (kWh)' : 'Comb. Consumido (L)';
  const unitConsumed = isEV ? 'kWh' : 'L';
  const labelAvg = isEV ? 'Consumo Médio (km/kWh)' : 'Consumo Médio (km/L)';
  const unitAvg = isEV ? 'km/kWh' : 'km/L';

  const goal = Number(vehicle?.goalKmPerLiter) || 8;
  const efficiency = goal > 0 ? Math.round((avgConsumption / goal) * 100) : 0;

  const maxTotal = Math.max(...chartData.map(d => d.total), 1);

  // Alerta de Óleo
  const oilChangeTarget = Number(vehicle?.oilChangeKm) || 0;
  const oilDiff = oilChangeTarget - lastRefuelOdo;
  const requireOilWarning = oilChangeTarget > 0 && oilDiff <= 100;
  const isOilOverdue = oilDiff < 0;

  const monthNames: Record<string, string> = {
    '01':'Jan','02':'Fev','03':'Mar','04':'Abr',
    '05':'Mai','06':'Jun','07':'Jul','08':'Ago',
    '09':'Set','10':'Out','11':'Nov','12':'Dez',
  };

  const Gauge = ({ value, label, min = 0, max = 100, unit = '', color = 'var(--accent)', goalMarkerVal }: any) => {
    const numValue = Number(value) || 0;
    const percent = Math.min(Math.max((numValue - min) / (max - min), 0), 1);
    const rotation = -90 + (percent * 180);

    return (
      <div className={styles.gaugeBox}>
        <div className={styles.gaugeOuter}>
          <div className={styles.gaugeInner}>
            <div className={styles.gaugeTicks}>
              {[0, 25, 50, 75, 100].map(t => (
                <div key={t} className={styles.tick} style={{ transform: `rotate(${-90 + (t/100 * 180)}deg)` }} />
              ))}
            </div>
            {goalMarkerVal !== undefined && (
              <div className={styles.goalMarker} style={{ transform: `rotate(${-90 + ((Number(goalMarkerVal) - min) / (max - min) * 180)}deg)` }} />
            )}
            <div className={styles.gaugeNeedle} style={{ transform: `rotate(${-90 + (percent * 180)}deg)`, backgroundColor: color }} />
            <div className={styles.gaugeCenter} />
            <div className={styles.gaugeValue}>
              <span className={styles.valueNum}>{numValue}</span>
              <span className={styles.valueUnit}>{unit}</span>
            </div>
            <div className={styles.scaleLabels}>
              <span>{min}</span>
              <span>{max}</span>
            </div>
          </div>
        </div>
        <span className="label" style={{marginTop: 8, marginBottom: 0, fontSize: '0.65rem'}}>{label}</span>
      </div>
    );
  };

  // ── COPO DE COMBUSTÍVEL ─────────────────────────────────────────────────────
  const FuelCup = ({ liters, maxLiters, isEV: isElectric }: { liters: number; maxLiters: number; isEV: boolean }) => {
    const pct = Math.min(Math.max(liters / maxLiters, 0), 1) * 100;
    const isLow = !isElectric && liters < 10;
    const fuelColor = isLow ? '#ff2020' : '#111111';
    const fuelGlow  = isLow ? 'rgba(255,32,32,0.7)' : 'rgba(0,0,0,0)';
    const displayVal = isElectric ? `${pct.toFixed(0)}%` : `${liters.toFixed(1)}L`;
    const label      = isElectric ? 'Bateria' : 'Tanque';

    return (
      <div className={styles.fuelCupWrapper}>
        <div className={`${styles.fuelCup} ${isLow ? styles.fuelCupLow : ''}`}>
          {/* Graduações laterais */}
          {[75, 50, 25].map(tick => (
            <div key={tick} className={styles.fuelTick} style={{ bottom: `${tick}%` }}>
              <span className={styles.fuelTickLabel}>{Math.round(maxLiters * tick / 100)}</span>
            </div>
          ))}
          {/* Líquido */}
          <div
            className={`${styles.fuelLiquid} ${isLow ? styles.fuelLiquidLow : ''}`}
            style={{
              height: `${pct}%`,
              background: isLow
                ? `linear-gradient(180deg, rgba(255,60,60,0.95) 0%, rgba(200,0,0,0.85) 100%)`
                : `linear-gradient(180deg, rgba(0,255,136,0.95) 0%, rgba(0,180,80,0.85) 100%)`,
              boxShadow: `0 0 18px ${fuelGlow}, inset 0 0 8px rgba(255,255,255,0.15)`,
            }}
          >
            {/* Onda animada no topo */}
            <div className={styles.fuelWave} style={{ background: fuelColor }} />
          </div>
          {/* Reflexo do copo */}
          <div className={styles.fuelGlassSheen} />
          {/* Valor central */}
          <div className={`${styles.fuelValue} ${isLow ? styles.fuelValueLow : ''}`}>
            <span className={styles.fuelValueNum} style={{ color: fuelColor, textShadow: `0 0 12px ${fuelGlow}` }}>
              {displayVal}
            </span>
          </div>
        </div>
        <span className={styles.fuelCupLabel} style={{ color: fuelColor, textShadow: `0 0 8px ${fuelGlow}` }}>
          {label}
        </span>
      </div>
    );
  };

  return (
    <div key={vId} className={styles.wrapper}>
    
      {/* ── ALERTA DE ÓLEO ────────────────────── */}
      {requireOilWarning && (
        <div style={{
          backgroundColor: isOilOverdue ? 'rgba(192, 57, 43, 0.15)' : 'rgba(192, 122, 32, 0.15)',
          color: isOilOverdue ? 'var(--danger)' : 'var(--accent)',
          border: `1px solid ${isOilOverdue ? 'var(--danger)' : 'var(--accent)'}`,
          padding: '12px 16px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '16px',
          fontWeight: 700,
          fontSize: '0.9rem',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          ⚠️ {isOilOverdue 
            ? `Troca de óleo Vencida! (Passou ${Math.abs(oilDiff)} km)` 
            : `Troca de óleo Próxima! (Faltam ${oilDiff} km)`
          }
        </div>
      )}

      {/* ── FUEL CUP + CONSUMO MÉDIO + KM PANEL ──────────── */}
      <div className={`card ${styles.gaugeCard}`}>
        <span className="section-title" style={{ display: 'block', textAlign: 'center', marginBottom: '16px', fontSize: '1.2rem', color: 'var(--text-2)' }}>⚡ FOTO NF</span>
        <div className={styles.gaugeRow}>
          {/* Copo de combustível / bateria */}
          <FuelCup
            liters={currentTankValue}
            maxLiters={maxTankValue}
            isEV={isEV}
          />
          {/* Consumo Médio — valor exibido fora do gauge, como KPI */}
          <div className={styles.avgConsumptionBox}>
            <span className={styles.avgConsumptionValue}
              style={{ color: avgConsumption >= goal ? 'var(--success)' : 'var(--accent-2)' }}
            >
              {avgConsumption > 0 ? avgConsumption.toFixed(2) : '—'}
            </span>
            <span className={styles.avgConsumptionUnit}>{unitAvg}</span>
            <span className={styles.avgConsumptionLabel}>{labelAvg}</span>
            {goal > 0 && (
              <span className={styles.avgConsumptionGoal}
                style={{ color: avgConsumption >= goal ? 'var(--success)' : 'var(--danger)' }}
              >
                {avgConsumption >= goal ? '✓ Meta atingida' : `Meta: ${goal} ${unitAvg}`}
              </span>
            )}
          </div>
          {/* Km percorrido — à direita do consumo médio */}
          <div className={styles.kmBox}>
            <span className={styles.kmValue}>{kmSinceLastRefuel}</span>
            <span className={styles.kmUnit}>km</span>
            <span className={styles.kmLabel}>Percorrido</span>
          </div>
        </div>
      </div>

      {/* ── ODO SKEUOMORPHIC ───────────────────── */}
      <div className={`card ${styles.odoSection}`}>
        <div className="flex justify-between items-center mb-4">
          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <span className="label" style={{marginBottom:0}}>Odômetro Atual</span>
            <button
              onClick={resetOdo}
              title="Resetar simulação"
              aria-label="Resetar odômetro para valor base"
              style={{
                background:'none', border:'1px solid var(--border)',
                borderRadius:'50%', width:'22px', height:'22px',
                cursor:'pointer', fontSize:'0.75rem', lineHeight:1,
                color:'var(--text-muted)', display:'flex',
                alignItems:'center', justifyContent:'center',
                padding:0, transition:'all 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              ↺
            </button>
          </div>
          <span className={styles.carName}>
            {vehicle?.name} 
            <span style={{ fontSize: '0.65rem', opacity: 0.6, marginLeft: '6px', border: '1px solid currentColor', padding: '1px 4px', borderRadius: '4px' }}>
              {(() => {
                const type = vehicle?.fuelType;
                if (type === 'gasolina') return 'GAS';
                if (type === 'etanol') return 'ETA';
                if (type === 'diesel') return 'DIE';
                if (type === 'eletrico') return 'ELE';
                if (type === 'flex') return 'FLX';
                return type || '';
              })()}
            </span>
          </span>
        </div>
        
        <div className={styles.odoContainer}>
          <div className={styles.odoBezel}>
            <div className={styles.odoWindow}>
              {/* Digit slots for skeuomorphic look */}
              {odoValue.padStart(6, '0').split('').map((digit, i) => (
                <div key={i} className={styles.odoDigit}>
                  <div className={styles.odoDigitInner}>
                    {digit}
                  </div>
                </div>
              ))}
              <input 
                type="number"
                inputMode="numeric"
                className={styles.odoHiddenInput}
                value={odoValue}
                onChange={(e) => handleOdoChange(e.target.value)}
                aria-label="Digitar odômetro atual"
              />
            </div>
            <div className={styles.odoUnit}>KM</div>
          </div>
        </div>
        
        <div style={{ marginTop: '24px' }}>
          <label
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '16px',
              fontSize: '0.9rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              cursor: isAnalyzing ? 'wait' : 'pointer',
              opacity: isAnalyzing ? 0.8 : 1,
              margin: 0,
              color: '#ce7e00',
              background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '30px',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              boxShadow: `
                0 15px 35px rgba(0, 0, 0, 0.6), 
                inset -8px -8px 20px rgba(0, 0, 0, 0.4), 
                inset 8px 8px 20px rgba(255, 255, 255, 0.15)
              `,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              textAlign: 'center',
              transform: 'translateY(-2px)'
            }}
          >
            <Camera size={20} color="#ce7e00" /> {isAnalyzing ? 'Processando...' : 'NF AI Pic'}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              style={{ display: 'none' }} 
              onClick={(e) => {
                if (odoValue === lastRefuelOdo.toString()) {
                  const confirmOdo = window.confirm("⚠️ ATENÇÃO: Você não atualizou a quilometragem atual do veículo!\n\nTem certeza que deseja continuar e usar o odômetro antigo?");
                  if (!confirmOdo) {
                    e.preventDefault();
                  }
                }
              }}
              onChange={handlePhotoUpload}
              disabled={isAnalyzing}
            />
          </label>
        </div>
      </div>




      {/* ── Gráfico Consumo ────────────────────── */}
      <div className={`card ${styles.chartCard}`}>
        <span className={`section-title ${styles.chartTitle}`}>Gastos — Últimos 6 Meses</span>
        <div className={styles.barChart}>
          {chartData.map((d, i) => {
            const pct = (d.total / maxTotal) * 100;
            const mm = d.month.split('-')[1];
            return (
              <div key={i} className={styles.barCol}>
                <span className={styles.barValue}>{formatCurrency(d.total).replace('R$','').trim()}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ height: `${pct}%` }}
                    title={`${d.month}: ${formatCurrency(d.total)}`}
                  />
                </div>
                <span className={styles.barMonth}>{monthNames[mm]}</span>
              </div>
            );
          })}
        </div>
      </div>



    </div>
  );
}
