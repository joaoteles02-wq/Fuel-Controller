/**
 * Utilitário para feedback tátil (Haptics)
 * Dispara vibrações leves em dispositivos compatíveis (Android/Web PWA)
 */
export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(40);
          break;
        case 'success':
          navigator.vibrate([10, 30, 10]);
          break;
        case 'warning':
          navigator.vibrate([30, 50, 30]);
          break;
        case 'error':
          navigator.vibrate([50, 20, 50, 20, 50]);
          break;
        default:
          navigator.vibrate(10);
      }
    }
  } catch (err) {
    console.warn('Haptics not available:', err);
  }
};
