'use client';

import { Scanner } from '@yudiel/react-qr-scanner';
import { X } from 'lucide-react';
import styles from './QRScanner.module.css';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  return (
    <div className={styles.overlay}>
      <div 
        className={styles.modal} 
        style={{ 
          padding: '24px', 
          maxWidth: '400px', 
          width: '90%',
          backgroundColor: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          borderRadius: '24px',
          border: '1px solid var(--glass-border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)', fontWeight: 700 }}>Escanear QR Code</h3>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'rgba(255,107,91,0.1)', 
              border: 'none', 
              color: '#ff6b5b', 
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>
        
        <div style={{ overflow: 'hidden', borderRadius: '16px', aspectRatio: '1/1', backgroundColor: '#000', border: '2px solid rgba(77, 171, 255, 0.3)' }}>
          <Scanner 
            onScan={(result) => {
              if (result && result.length > 0) {
                const url = result[0].rawValue;
                onScan(url);
              }
            }}
            components={{ finder: true, torch: true }}
          />
        </div>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-2)', fontWeight: 500 }}>
          Aponte a câmera para o QR Code da Nota Fiscal
        </p>
      </div>
    </div>
  );
}
