// ─── Types ────────────────────────────────────────────────────────────────────

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  tankLiters: number;
  fuelType: 'gasolina' | 'etanol' | 'flex' | 'diesel' | 'gnv' | 'eletrico';
  plate: string;
  color: string;
  goalKmPerLiter: number;
  odometer: number;
  oilChangeKm: number;
}

export interface Refuel {
  id: number;
  vehicleId: string;
  date: string;
  odometer: number;
  distance: number;
  driveType: string;
  spentFuel: number;
  tankCapacity: number;
  fuelSupplied: number;
  gasStation: string;
  total: number;
  unitValue: number;
  consumption: number;
  tankLevel: string;
  periodDays: number;
  photoBill: string;
  nfeKey?: string;
}

// ─── Vehicles ─────────────────────────────────────────────────────────────────

export const vehicles: Vehicle[] = [
  {
    id: 'hyundai-i30',
    name: 'Hyundai I-30',
    type: 'Sedan',
    tankLiters: 53,
    fuelType: 'gasolina',
    plate: '---',
    color: '#c07a20',
    goalKmPerLiter: 8.0,
    odometer: 70460,
    oilChangeKm: 75000,
  },
];

// ─── Raw CSV Data ──────────────────────────────────────────────────────────────

export const refuels: Refuel[] = [
  { id: 8,  vehicleId:'hyundai-i30', date:'2024-07-27', odometer:62702, distance:156, driveType:'City', spentFuel:20.45, tankCapacity:53, fuelSupplied:18.73, gasStation:'P V Rao 2',           total:104.70, unitValue:5.59, consumption:8.33, tankLevel:'',                    periodDays:14, photoBill:'' },
  { id: 9,  vehicleId:'hyundai-i30', date:'2024-08-06', odometer:62855, distance:153, driveType:'City', spentFuel:18.37, tankCapacity:53, fuelSupplied:20.00, gasStation:'P V Rao 2',           total:113.80, unitValue:5.69, consumption:7.65, tankLevel:'Full Tank',           periodDays:10, photoBill:'Combustível_Images/08-06-2024.Photo Bill.135619.jpg' },
  { id: 10, vehicleId:'hyundai-i30', date:'2024-08-17', odometer:63017, distance:162, driveType:'City', spentFuel:21.18, tankCapacity:53, fuelSupplied:25.92, gasStation:'Av Interlagos',      total:147.48, unitValue:5.69, consumption:6.25, tankLevel:'Full Tank',  periodDays:11, photoBill:'Combustível_Images/1063017.Photo Bill.192656.jpg' },
  { id: 11, vehicleId:'hyundai-i30', date:'2024-08-27', odometer:63180, distance:163, driveType:'City', spentFuel:26.08, tankCapacity:53, fuelSupplied:19.90, gasStation:'P V Rao 2',           total:115.22, unitValue:5.79, consumption:8.19, tankLevel:'Full Tank',  periodDays:10, photoBill:'Combustível_Images/1163180.Photo Bill.130806.jpg' },
  { id: 12, vehicleId:'hyundai-i30', date:'2024-09-07', odometer:63406, distance:226, driveType:'City', spentFuel:27.59, tankCapacity:53, fuelSupplied:26.06, gasStation:'P V Rao 2',           total:150.37, unitValue:5.77, consumption:8.67, tankLevel:'Full Tank',  periodDays:11, photoBill:'Combustível_Images/1263406.Photo Bill.202626.jpg' },
  { id: 13, vehicleId:'hyundai-i30', date:'2024-09-17', odometer:63582, distance:176, driveType:'City', spentFuel:20.30, tankCapacity:53, fuelSupplied:27.69, gasStation:'P Berrini 355',       total:151.77, unitValue:5.48, consumption:6.36, tankLevel:'Full Tank',  periodDays:10, photoBill:'Combustível_Images/1363582.Photo Bill.150529.jpg' },
  { id: 14, vehicleId:'hyundai-i30', date:'2024-09-28', odometer:63777, distance:195, driveType:'City', spentFuel:30.66, tankCapacity:53, fuelSupplied:26.44, gasStation:'P V Rao',             total:150.44, unitValue:5.69, consumption:7.38, tankLevel:'Full Tank',  periodDays:11, photoBill:'Combustível_Images/1463777.Photo Bill.192605.jpg' },
  { id: 15, vehicleId:'hyundai-i30', date:'2024-10-08', odometer:63939, distance:162, driveType:'City', spentFuel:21.95, tankCapacity:53, fuelSupplied:20.86, gasStation:'P V Rao 2',           total:118.69, unitValue:5.69, consumption:7.77, tankLevel:'Full Tank',  periodDays:10, photoBill:'Combustível_Images/1563939.Photo Bill.125009.jpg' },
  { id: 16, vehicleId:'hyundai-i30', date:'2024-10-19', odometer:64129, distance:190, driveType:'City', spentFuel:24.45, tankCapacity:53, fuelSupplied:26.65, gasStation:'P V Rao 2',           total:151.64, unitValue:5.69, consumption:7.13, tankLevel:'Full Tank',  periodDays:11, photoBill:'Combustível_Images/1664129.Photo Bill.132600.jpg' },
  { id: 17, vehicleId:'hyundai-i30', date:'2024-10-29', odometer:64310, distance:181, driveType:'City', spentFuel:25.39, tankCapacity:53, fuelSupplied:22.85, gasStation:'P V Rao',             total:130.03, unitValue:5.69, consumption:7.92, tankLevel:'Full Tank',  periodDays:10, photoBill:'Combustível_Images/1764310.Photo Bill.130432.jpg' },
  { id: 18, vehicleId:'hyundai-i30', date:'2024-11-12', odometer:64507, distance:197, driveType:'City', spentFuel:24.87, tankCapacity:53, fuelSupplied:27.17, gasStation:'P V Rao',             total:154.50, unitValue:5.69, consumption:7.25, tankLevel:'Full Tank',  periodDays:14, photoBill:'Combustível_Images/1864507.Photo Bill.135227.jpg' },
  { id: 19, vehicleId:'hyundai-i30', date:'2024-11-27', odometer:64700, distance:193, driveType:'City', spentFuel:26.62, tankCapacity:53, fuelSupplied:26.13, gasStation:'P V Rao 2',           total:148.21, unitValue:5.67, consumption:7.39, tankLevel:'Full Tank',  periodDays:15, photoBill:'Combustível_Images/1964700.Photo Bill.123135.jpg' },
  { id: 20, vehicleId:'hyundai-i30', date:'2024-12-10', odometer:64872, distance:172, driveType:'City', spentFuel:23.27, tankCapacity:53, fuelSupplied:24.97, gasStation:'P V Rao 2',           total:141.58, unitValue:5.67, consumption:6.89, tankLevel:'Full Tank',  periodDays:13, photoBill:'Combustível_Images/2064872.Photo Bill.130617.jpg' },
  { id: 21, vehicleId:'hyundai-i30', date:'2024-12-23', odometer:65066, distance:194, driveType:'City', spentFuel:28.16, tankCapacity:53, fuelSupplied:25.09, gasStation:'P V Rao 2',           total:142.26, unitValue:5.67, consumption:7.73, tankLevel:'Full Tank',  periodDays:13, photoBill:'Combustível_Images/2165066.Photo Bill.131905.jpg' },
  { id: 22, vehicleId:'hyundai-i30', date:'2025-01-13', odometer:65302, distance:236, driveType:'City', spentFuel:30.53, tankCapacity:53, fuelSupplied:30.84, gasStation:'Posto João Dias',     total:184.70, unitValue:5.99, consumption:7.65, tankLevel:'Full Tank',  periodDays:21, photoBill:'Combustível_Images/2265302.Photo Bill.132740.jpg' },
  { id: 23, vehicleId:'hyundai-i30', date:'2025-01-31', odometer:65478, distance:176, driveType:'City', spentFuel:23.01, tankCapacity:53, fuelSupplied:22.40, gasStation:'P V Rao 2',           total:127.01, unitValue:5.67, consumption:7.86, tankLevel:'Full Tank',  periodDays:18, photoBill:'Combustível_Images/2365478.Photo Bill.125602.jpg' },
  { id: 24, vehicleId:'hyundai-i30', date:'2025-02-17', odometer:65705, distance:227, driveType:'City', spentFuel:28.88, tankCapacity:53, fuelSupplied:29.54, gasStation:'Posto Nações Unidas', total:167.49, unitValue:5.67, consumption:7.68, tankLevel:'Full Tank',  periodDays:17, photoBill:'Combustível_Images/2465705.Photo Bill.140850.jpg' },
  { id: 25, vehicleId:'hyundai-i30', date:'2025-03-09', odometer:65923, distance:218, driveType:'City', spentFuel:28.39, tankCapacity:53, fuelSupplied:32.66, gasStation:'',                    total:185.23, unitValue:5.67, consumption:6.67, tankLevel:'Full Tank',  periodDays:20, photoBill:'Combustível_Images/2565923.Photo Bill.133702.jpg' },
  { id: 26, vehicleId:'hyundai-i30', date:'2025-03-25', odometer:66133, distance:210, driveType:'City', spentFuel:31.48, tankCapacity:53, fuelSupplied:28.24, gasStation:'P V Rao 2',           total:163.51, unitValue:5.79, consumption:7.44, tankLevel:'Full Tank',  periodDays:16, photoBill:'Combustível_Images/2666133.Photo Bill.135119.jpg' },
  { id: 27, vehicleId:'hyundai-i30', date:'2025-04-18', odometer:66369, distance:236, driveType:'City', spentFuel:31.72, tankCapacity:53, fuelSupplied:32.45, gasStation:'P V Rao 2',           total:187.94, unitValue:5.79, consumption:7.27, tankLevel:'Full Tank',  periodDays:24, photoBill:'Combustível_Images/2766369.Photo Bill.142322.jpg' },
  { id: 28, vehicleId:'hyundai-i30', date:'2025-05-04', odometer:66554, distance:185, driveType:'City', spentFuel:25.45, tankCapacity:53, fuelSupplied:22.63, gasStation:'P V Rao 2',           total:131.03, unitValue:5.79, consumption:8.17, tankLevel:'Full Tank',  periodDays:16, photoBill:'Combustível_Images/2866554.Photo Bill.201412.jpg' },
  { id: 29, vehicleId:'hyundai-i30', date:'2025-05-23', odometer:66765, distance:211, driveType:'City', spentFuel:25.83, tankCapacity:53, fuelSupplied:26.17, gasStation:'P V Rao 2',           total:150.74, unitValue:5.76, consumption:8.06, tankLevel:'Full Tank',  periodDays:19, photoBill:'Combustível_Images/2966765.Photo Bill.132853.jpg' },
  { id: 30, vehicleId:'hyundai-i30', date:'2025-06-08', odometer:66979, distance:214, driveType:'City', spentFuel:26.55, tankCapacity:53, fuelSupplied:27.58, gasStation:'P V Rao 2',           total:156.93, unitValue:5.69, consumption:7.76, tankLevel:'Full Tank',  periodDays:16, photoBill:'Combustível_Images/3066979.Photo Bill.205105.jpg' },
  { id: 31, vehicleId:'hyundai-i30', date:'2025-06-26', odometer:67205, distance:226, driveType:'City', spentFuel:29.12, tankCapacity:53, fuelSupplied:28.34, gasStation:'P V Rao 2',           total:158.42, unitValue:5.59, consumption:7.97, tankLevel:'Full Tank',  periodDays:18, photoBill:'Combustível_Images/3167205.Photo Bill.125914.jpg' },
  { id: 32, vehicleId:'hyundai-i30', date:'2025-07-18', odometer:67476, distance:271, driveType:'City', spentFuel:34.00, tankCapacity:53, fuelSupplied:34.42, gasStation:'P V Rao 2',           total:192.41, unitValue:5.59, consumption:7.87, tankLevel:'Full Tank',  periodDays:22, photoBill:'Combustível_Images/3267476.Photo Bill.134106.jpg' },
  { id: 33, vehicleId:'hyundai-i30', date:'2025-08-07', odometer:67733, distance:257, driveType:'City', spentFuel:32.66, tankCapacity:53, fuelSupplied:32.09, gasStation:'P V Rao 2',           total:179.38, unitValue:5.59, consumption:8.01, tankLevel:'Full Tank',  periodDays:20, photoBill:'Combustível_Images/3367733.Photo Bill.135354.jpg' },
  { id: 34, vehicleId:'hyundai-i30', date:'2025-08-29', odometer:68020, distance:287, driveType:'City', spentFuel:35.83, tankCapacity:53, fuelSupplied:42.10, gasStation:'P V Rao 2',           total:238.29, unitValue:5.66, consumption:6.82, tankLevel:'Full Tank',  periodDays:22, photoBill:'Combustível_Images/3468020.Photo Bill.132829.jpg' },
  { id: 35, vehicleId:'hyundai-i30', date:'2025-09-18', odometer:68265, distance:245, driveType:'City', spentFuel:35.92, tankCapacity:53, fuelSupplied:33.62, gasStation:'P V Rao 2',           total:193.65, unitValue:5.76, consumption:7.29, tankLevel:'Full Tank',  periodDays:20, photoBill:'Combustível_Images/3568265.Photo Bill.131947.jpg' },
  { id: 36, vehicleId:'hyundai-i30', date:'2025-10-09', odometer:68527, distance:262, driveType:'City', spentFuel:35.94, tankCapacity:53, fuelSupplied:31.73, gasStation:'P V Rao',             total:179.91, unitValue:5.67, consumption:8.26, tankLevel:'Full Tank',  periodDays:21, photoBill:'Combustível_Images/3668527.Photo Bill.130302.jpg' },
  { id: 37, vehicleId:'hyundai-i30', date:'2025-11-03', odometer:68815, distance:288, driveType:'City', spentFuel:34.87, tankCapacity:53, fuelSupplied:38.23, gasStation:'P V Rao',             total:216.76, unitValue:5.67, consumption:7.53, tankLevel:'Full Tank',  periodDays:25, photoBill:'Combustível_Images/3768815.Photo Bill.130041.jpg' },
  { id: 38, vehicleId:'hyundai-i30', date:'2025-11-24', odometer:69101, distance:286, driveType:'City', spentFuel:37.98, tankCapacity:53, fuelSupplied:39.95, gasStation:'P V Rao 2',           total:229.31, unitValue:5.74, consumption:7.16, tankLevel:'Full Tank',  periodDays:21, photoBill:'Combustível_Images/3869101.Photo Bill.130019.jpg' },
  { id: 39, vehicleId:'hyundai-i30', date:'2025-12-12', odometer:69337, distance:236, driveType:'City', spentFuel:32.96, tankCapacity:53, fuelSupplied:31.91, gasStation:'Posto Paz',           total:181.57, unitValue:5.69, consumption:7.40, tankLevel:'Full Tank',  periodDays:18, photoBill:'Combustível_Images/3969337.Photo Bill.134618.jpg' },
  { id: 40, vehicleId:'hyundai-i30', date:'2026-01-09', odometer:69662, distance:325, driveType:'City', spentFuel:43.92, tankCapacity:53, fuelSupplied:39.76, gasStation:'Posto Paz',           total:234.19, unitValue:5.89, consumption:8.17, tankLevel:'Full Tank',  periodDays:28, photoBill:'Combustível_Images/4069662.Photo Bill.145500.jpg' },
  { id: 41, vehicleId:'hyundai-i30', date:'2026-02-02', odometer:69951, distance:289, driveType:'City', spentFuel:35.37, tankCapacity:53, fuelSupplied:38.67, gasStation:'Posto Paz',           total:221.97, unitValue:5.74, consumption:7.47, tankLevel:'Full Tank',  periodDays:24, photoBill:'Combustível_Images/4169951.Photo Bill.134441.jpg' },
  { id: 42, vehicleId:'hyundai-i30', date:'2026-02-23', odometer:70211, distance:260, driveType:'City', spentFuel:34.81, tankCapacity:53, fuelSupplied:36.84, gasStation:'P V Rao 2',           total:213.30, unitValue:5.79, consumption:7.06, tankLevel:'Full Tank',  periodDays:21, photoBill:'Combustível_Images/4270211.Photo Bill.131407.jpg' },
  { id: 43, vehicleId:'hyundai-i30', date:'2026-03-24', odometer:70460, distance:249, driveType:'City', spentFuel:35.27, tankCapacity:53, fuelSupplied:35.71, gasStation:'Posto Paz',           total:231.76, unitValue:6.49, consumption:6.97, tankLevel:'Full Tank',  periodDays:29, photoBill:'Combustível_Images/4370460.Photo Bill.144012.jpg' },
];

// ─── KPI Helpers ──────────────────────────────────────────────────────────────

// ─── KPI Helpers ──────────────────────────────────────────────────────────────
export function getMonthlyTotal(refuelList: Refuel[], vehicleId?: string): number {
  const now = new Date();
  const filtered = refuelList.filter(r => {
    const d = new Date(r.date);
    const sameVehicle = vehicleId ? r.vehicleId === vehicleId : true;
    return sameVehicle && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  return filtered.reduce((acc, r) => acc + r.total, 0);
}

export function getAverageConsumption(refuelList: Refuel[], vehicleId?: string): number {
  const totalKm = getTotalKm(refuelList, vehicleId);
  const totalFuel = getTotalFuelConsumed(refuelList, vehicleId);
  if (totalFuel === 0) return 0;
  return Math.round((totalKm / totalFuel) * 100) / 100;
}

export function getTotalRefuels(refuelList: Refuel[], vehicleId?: string): number {
  return vehicleId ? refuelList.filter(r => r.vehicleId === vehicleId).length : refuelList.length;
}

export function getTotalKm(refuelList: Refuel[], vehicleId?: string): number {
  const filtered = vehicleId ? refuelList.filter(r => r.vehicleId === vehicleId) : refuelList;
  return filtered.reduce((acc, r) => acc + (Number(r.distance) || 0), 0);
}

export function getTotalFuelConsumed(refuelList: Refuel[], vehicleId?: string): number {
  const filtered = vehicleId ? refuelList.filter(r => r.vehicleId === vehicleId) : refuelList;
  return Math.round(filtered.reduce((acc, r) => acc + (Number(r.fuelSupplied) || 0), 0) * 100) / 100;
}

export function getCostPerKm(refuelList: Refuel[], vehicleId?: string): number {
  const filtered = vehicleId ? refuelList.filter(r => r.vehicleId === vehicleId) : refuelList;
  const totalCost = filtered.reduce((acc, r) => acc + r.total, 0);
  const totalKm = filtered.reduce((acc, r) => acc + r.distance, 0);
  if (!totalKm) return 0;
  return Math.round((totalCost / totalKm) * 100) / 100;
}

export function getLast6MonthsData(refuelList: Refuel[], vehicleId?: string) {
  const filtered = vehicleId ? refuelList.filter(r => r.vehicleId === vehicleId) : refuelList;
  const months: Record<string, { total: number; consumption: number; count: number }> = {};

  filtered.forEach(r => {
    const d = new Date(r.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!months[key]) months[key] = { total: 0, consumption: 0, count: 0 };
    months[key].total += r.total;
    months[key].consumption += r.consumption;
    months[key].count += 1;
  });

  const sorted = Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  return sorted.map(([key, val]) => ({
    month: key,
    total: Math.round(val.total * 100) / 100,
    avgConsumption: Math.round((val.consumption / val.count) * 100) / 100,
  }));
}

export function formatCurrency(val: number): string {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '---';
  // Tenta criar o objeto de data
  let d = new Date(dateStr + 'T12:00:00');
  
  // Se falhar (NaN), tenta sem o T12:00:00
  if (isNaN(d.getTime())) {
    d = new Date(dateStr);
  }

  // Se ainda assim falhar, retorna o texto original para não ficar em branco
  if (isNaN(d.getTime())) return dateStr;

  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function hapticFeedback(type: 'success' | 'error' | 'warning' | 'impactLight' | 'impactMedium' | 'impactHeavy' = 'impactLight') {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    switch (type) {
      case 'success': window.navigator.vibrate([10, 30, 10, 30, 50]); break;
      case 'error': window.navigator.vibrate([50, 50, 50]); break;
      case 'warning': window.navigator.vibrate([30, 30]); break;
      default: window.navigator.vibrate(10); break;
    }
  }
}
