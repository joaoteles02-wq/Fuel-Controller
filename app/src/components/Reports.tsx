'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { formatCurrency, formatDate } from '@/lib/data';
import styles from './Reports.module.css';

type Period = '3m' | '6m' | '1a' | 'all';

export default function Reports() {
  const { refuels, selectedVehicleId, vehicles } = useApp();
  const [period, setPeriod] = useState<Period>('6m');

  const vehicle = vehicles.find(v => v.id === selectedVehicleId);
  const goal    = vehicle?.goalKmPerLiter ?? 8;

  const now = new Date();
  const cutoff: Record<Period, Date> = {
    '3m':  new Date(now.getFullYear(), now.getMonth() - 3, 1),
    '6m':  new Date(now.getFullYear(), now.getMonth() - 6, 1),
    '1a':  new Date(now.getFullYear() - 1, now.getMonth(), 1),
    'all': new Date(2000, 0, 1),
  };

  const filtered = refuels
    .filter(r => r.vehicleId === selectedVehicleId && new Date(r.date) >= cutoff[period])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());



  const totalSpent    = filtered.reduce((s, r) => s + r.total, 0);
  const totalKm       = filtered.reduce((s, r) => s + r.distance, 0);
  const totalLiters   = filtered.reduce((s, r) => s + r.fuelSupplied, 0);
  const avgConsumption = filtered.length
    ? filtered.reduce((s, r) => s + r.consumption, 0) / filtered.length : 0;
  const costPerKm     = totalKm > 0 ? totalSpent / totalKm : 0;
  const avgTotal      = filtered.length ? totalSpent / filtered.length : 0;

  // Agrupar por mês
  const byMonth: Record<string, { total: number; km: number; liters: number; count: number; avgC: number }> = {};
  filtered.forEach(r => {
    const d   = new Date(r.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth[key]) byMonth[key] = { total: 0, km: 0, liters: 0, count: 0, avgC: 0 };
    byMonth[key].total  += r.total;
    byMonth[key].km     += r.distance;
    byMonth[key].liters += r.fuelSupplied;
    byMonth[key].count  += 1;
    byMonth[key].avgC   += r.consumption;
  });
  const months = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => ({ month: k, ...v, avgC: v.avgC / v.count }));

  const maxTotal = Math.max(...months.map(m => m.total), 1);
  const monthNames: Record<string, string> = {
    '01':'Jan','02':'Fev','03':'Mar','04':'Abr',
    '05':'Mai','06':'Jun','07':'Jul','08':'Ago',
    '09':'Set','10':'Out','11':'Nov','12':'Dez',
  };

  // Inefficient Stations ranking
  const stations: Record<string, { total: number; count: number; consumptionSum: number }> = {};
  filtered.forEach(r => {
    const name = r.gasStation || 'Sem nome';
    if (!stations[name]) stations[name] = { total: 0, count: 0, consumptionSum: 0 };
    stations[name].total += r.total;
    stations[name].count += 1;
    stations[name].consumptionSum += r.consumption;
  });
  const inefficientStations = Object.entries(stations)
    .map(([name, data]) => ({ name, avgC: data.consumptionSum / data.count, count: data.count, total: data.total }))
    .filter(s => s.avgC < goal)
    .sort((a, b) => a.avgC - b.avgC) // Sort by worst efficiency
    .slice(0, 4);

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.pageTitle}>📊 Relatórios</h1>

      {/* Filtro */}
      <div className={styles.filterRow}>
        {(['3m','6m','1a','all'] as Period[]).map(p => (
          <button
            key={p}
            id={`filter-${p}`}
            className={`${styles.filterBtn} ${period === p ? styles.filterActive : ''}`}
            onClick={() => setPeriod(p)}
          >
            {p === '3m' ? '3 Meses' : p === '6m' ? '6 Meses' : p === '1a' ? '1 Ano' : 'Tudo'}
          </button>
        ))}
      </div>

      {/* KPIs resumo */}
      <div className={styles.kpiGrid}>
        <div className={`card-sm ${styles.kpiBlock}`}>
          <span className={styles.kpiLabel}>💰 Total Gasto</span>
          <span className={`value-mono ${styles.kpiNum}`}>{formatCurrency(totalSpent)}</span>
        </div>
        <div className={`card-sm ${styles.kpiBlock}`}>
          <span className={styles.kpiLabel}>📏 Km rodados</span>
          <span className={`value-mono ${styles.kpiNum}`}>{totalKm.toLocaleString('pt-BR')}</span>
        </div>
        <div className={`card-sm ${styles.kpiBlock}`}>
          <span className={styles.kpiLabel}>⛽ Total Litros</span>
          <span className={`value-mono ${styles.kpiNum}`}>{totalLiters.toFixed(1)} L</span>
        </div>
        <div className={`card-sm ${styles.kpiBlock}`}>
          <span className={styles.kpiLabel}>📊 Médio km/L</span>
          <span className={`value-mono ${styles.kpiNum}`}>{avgConsumption.toFixed(2)}</span>
        </div>
        <div className={`card-sm ${styles.kpiBlock}`}>
          <span className={styles.kpiLabel}>🏎️ Custo/km</span>
          <span className={`value-mono ${styles.kpiNum}`}>{formatCurrency(costPerKm)}</span>
        </div>
        <div className={`card-sm ${styles.kpiBlock}`}>
          <span className={styles.kpiLabel}>🔢 Média/abast.</span>
          <span className={`value-mono ${styles.kpiNum}`}>{formatCurrency(avgTotal)}</span>
        </div>
      </div>

      {/* Gráfico mensal */}
      <div className={`card ${styles.chartCard}`}>
        <span className="section-title" style={{display:'block', marginBottom:'16px'}}>
          Gasto Mensal
        </span>
        <div className={styles.lineChart}>
          {months.map((m, i) => {
            const pct    = (m.total / maxTotal) * 100;
            const mm     = m.month.split('-')[1];
            const aboveGoal = m.avgC >= goal;
            return (
              <div key={i} className={styles.lineCol}>
                <span className={styles.lineValue}>
                  {formatCurrency(m.total).replace('R$','').trim()}
                </span>
                <div className={styles.lineTrack} title={`${m.month}: ${formatCurrency(m.total)}`}>
                  <div
                    className={styles.lineFill}
                    style={{
                      height: `${pct}%`,
                      background: aboveGoal
                        ? 'linear-gradient(180deg, var(--success), #1a7a42)'
                        : 'linear-gradient(180deg, var(--accent-2), var(--accent))',
                    }}
                  />
                </div>
                <span className={styles.lineMonth}>{monthNames[mm]}</span>
                <span
                  className={aboveGoal ? 'badge-success' : 'badge-danger'}
                  style={{fontSize:'0.55rem', padding:'1px 5px'}}
                >
                  {m.avgC.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
        <div className={styles.chartLegend}>
          <span className="badge-success">✔ ≥ meta {goal} km/L</span>
          <span className="badge-danger">✘ abaixo da meta</span>
        </div>
      </div>

      {/* Evolução consumo */}
      <div className={`card ${styles.consumptionCard}`}>
        <span className="section-title" style={{display:'block', marginBottom:'12px'}}>
          Evolução do Consumo (km/L)
        </span>
        <div className={styles.consumptionList}>
          {filtered.slice(-10).map(r => {
            const pct = Math.min((r.consumption / (goal * 1.3)) * 100, 100);
            const ok  = r.consumption >= goal;
            return (
              <div key={r.id} className={styles.consumptionRow}>
                <span className={styles.consumptionDate}>{formatDate(r.date)}</span>
                <div className={styles.consumptionBar}>
                  <div
                    className={styles.consumptionFill}
                    style={{
                      width: `${pct}%`,
                      background: ok ? 'var(--success)' : 'var(--danger)',
                    }}
                  />
                  <span
                    className={`value-mono ${styles.consumptionVal}`}
                    style={{color: ok ? 'var(--success)' : 'var(--danger)'}}
                  >
                    {r.consumption.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Postos Ineficientes */}
      <div className={`card ${styles.stationsCard}`}>
        <span className="section-title" style={{display:'block', marginBottom:'12px'}}>
          ⚠️ Postos pouca eficiência
        </span>
        <div className={styles.stationsList}>
          {inefficientStations.map((s, i) => (
            <div key={s.name} className={styles.stationRow}>
              <span className={styles.stationRank}>#{i+1}</span>
              <div className={styles.stationInfo}>
                <span className={styles.stationName}>{s.name}</span>
                <span className="text-muted" style={{fontSize:'0.75rem'}}>
                  {s.count} abastec. • Média: <span style={{color: 'var(--danger)'}}>{s.avgC.toFixed(2)} km/L</span>
                </span>
              </div>
            </div>
          ))}
          {inefficientStations.length === 0 && (
            <span className="text-muted">Nenhum posto ineficiente no período</span>
          )}
        </div>
      </div>



    </div>
  );
}
