'use client';

import { useApp } from '@/lib/context';
import { formatCurrency, formatDate } from '@/lib/data';
import { Copy } from 'lucide-react';
import styles from './Reports.module.css';

export default function HistoryPage() {
  const { refuels, selectedVehicleId, vehicles, deleteRefuel } = useApp();
  const vehicle = vehicles.find(v => v.id === selectedVehicleId);
  const goal    = vehicle?.goalKmPerLiter ?? 8;

  const lastRefuels = refuels
    .filter(r => r.vehicleId === selectedVehicleId)
    .sort((a, b) => {
      const db = new Date(b.date).getTime() || 0;
      const da = new Date(a.date).getTime() || 0;
      if (db !== da) return db - da;
      return (b.id || 0) - (a.id || 0);
    });

  const handleDelete = (id: number) => {
    if (window.confirm("Atenção: Tem certeza que deseja excluir permanentemente este registro de abastecimento?")) {
      deleteRefuel(id);
    }
  };

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.pageTitle}>Histórico de Abastecimentos</h1>

      <div className={`card ${styles.historySection}`} style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {lastRefuels.map(r => (
            <div key={r.id} className="card-sm" style={{ 
              padding: '16px', 
              display: 'flex', 
              flexDirection: 'column',
              gap: '12px'
            }}>
              {/* === LINHA SUPERIOR: POSTO E KM/L (DESTAQUE) === */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.gasStation || (vehicle?.fuelType === 'eletrico' ? 'Eletroposto s/ nome' : 'Posto s/ nome')}
                  </span>
                  <span className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                    {formatDate(r.date)}
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginTop: '2px', letterSpacing: '0.5px' }}>
                    {(() => {
                      const type = vehicles.find(v => v.id === r.vehicleId)?.fuelType;
                      if (type === 'gasolina') return 'GAS';
                      if (type === 'etanol') return 'ETA';
                      if (type === 'diesel') return 'DIE';
                      if (type === 'eletrico') return 'ELE';
                      if (type === 'flex') return 'FLX';
                      return type || '---';
                    })()}
                  </span>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                      onClick={() => handleDelete(r.id)}
                      title="Excluir Histórico"
                      style={{
                        background: 'none', border: 'none', padding: '4px', cursor: 'pointer',
                        color: 'var(--danger)', opacity: 0.8, fontSize: '1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                  <span className={r.consumption >= goal ? 'badge-success' : 'badge-danger'} style={{ fontSize: '0.95rem', padding: '4px 12px' }}>
                    {r.consumption.toFixed(1)} <small style={{fontSize: '0.7rem'}}>{vehicle?.fuelType === 'eletrico' ? 'km/kWh' : 'km/L'}</small>
                  </span>
                  {/* Ícones de NFe e Copiar Chave abaixo do KM/L */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                    {r.nfeKey && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(r.nfeKey!);
                          alert('Chave de acesso copiada!');
                        }}
                        title="Copiar Chave de Acesso"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: '#4dabff',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(59, 130, 246, 0.4)',
                          cursor: 'pointer',
                        }}
                      >
                        <Copy size={12} />
                      </button>
                    )}
                    {r.photoBill ? (
                        <a
                          href={r.photoBill}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ver Nota Fiscal"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: '#4dabff',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid rgba(59, 130, 246, 0.4)',
                            textDecoration: 'none',
                          }}
                        >
                          📄 NFe
                        </a>
                    ) : (
                      <span
                        title="Sem nota fiscal"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: 'var(--text-muted, #666)',
                          opacity: 0.4,
                        }}
                      >
                        📄 —
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />
              
              {/* === LINHA DE DADOS (ALINHADOS) === */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.2fr', gap: '8px', alignItems: 'end' }}>
                {/* PREÇO */}
                <div>
                  <span className="label" style={{ fontSize: '0.65rem', marginBottom: '2px' }}>{vehicle?.fuelType === 'eletrico' ? 'R$/kWh' : 'R$/Litro'}</span>
                  <span className="value-mono" style={{ fontSize: '0.95rem', color: 'var(--accent)' }}>{formatCurrency(r.unitValue)}</span>
                </div>
                {/* LITROS/KWH */}
                <div style={{ textAlign: 'center' }}>
                  <span className="label" style={{ fontSize: '0.65rem', marginBottom: '2px' }}>Abast.</span>
                  <span className="value-mono" style={{ fontSize: '0.95rem' }}>{r.fuelSupplied.toFixed(1)}{vehicle?.fuelType === 'eletrico' ? 'kWh' : 'L'}</span>
                </div>
                {/* KM */}
                <div style={{ textAlign: 'center' }}>
                  <span className="label" style={{ fontSize: '0.65rem', marginBottom: '2px' }}>KM</span>
                  <span className="value-mono" style={{ fontSize: '1.2rem', fontWeight: 700 }}>{r.odometer}</span>
                </div>
                {/* TOTAL */}
                <div style={{ textAlign: 'right' }}>
                  <span className="label" style={{ fontSize: '0.65rem', marginBottom: '2px' }}>Valor Pago</span>
                  <span className="value-mono" style={{ fontSize: '1rem', color: 'var(--text)' }}>{formatCurrency(r.total)}</span>
                </div>
              </div>
            </div>
          ))}
          {lastRefuels.length === 0 && (
            <span className="text-muted" style={{textAlign:'center', marginTop:16}}>Nenhum histórico disponível</span>
          )}
        </div>
      </div>
    </div>
  );
}
