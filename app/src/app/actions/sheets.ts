'use server';

import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

function getAuth() {
  const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!CLIENT_EMAIL || !PRIVATE_KEY) {
    throw new Error('Credenciais ausentes no ambiente');
  }

  return new JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

const parseNumber = (val: any) => {
  if (!val) return 0;
  // Remove símbolos de moeda, espaços e troca vírgula por ponto
  const cleanVal = String(val).replace(/[R$\s.]/g, '').replace(',', '.');
  return parseFloat(cleanVal) || 0;
};

const parseBrazilianDate = (dateStr: any) => {
  if (!dateStr) return '';
  const s = String(dateStr).trim();
  // Se já estiver no formato AAAA-MM-DD, mantém
  if (s.includes('-') && s.split('-')[0].length === 4) return s;
  // Se estiver no formato DD/MM/AAAA, converte para AAAA-MM-DD para o JS entender
  const parts = s.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
    return `${year}-${month}-${day}`;
  }
  return s;
};

export async function appendRefuelToSheets(refuelData: any) {
  try {
    console.log('Iniciando appendRefuelToSheets...');
    const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    console.log('Spreadsheet ID:', SPREADSHEET_ID);

    const auth = getAuth();
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID!, auth);
    
    console.log('Carregando info da planilha...');
    await doc.loadInfo();
    console.log('Planilha carregada:', doc.title);

    let sheet = doc.sheetsByTitle['Combustível'];
    if (!sheet) {
      console.log('Aba "Combustível" não encontrada, usando a primeira aba.');
      sheet = doc.sheetsByIndex[0];
    }
    
    let linkString = String(refuelData.photoBill || '');
    let nfeKey = '';
    
    // Remove os espaços em branco para facilitar encontrar os 44 dígitos da chave
    const noSpaces = linkString.replace(/\s+/g, '');
    const keyMatch = noSpaces.match(/\d{44}/);
    if (keyMatch) {
      nfeKey = keyMatch[0];
    }

    // Extrai apenas a URL (http...) da string, ignorando textos que a IA possa ter colocado junto
    let cleanLink = linkString;
    const urlMatch = linkString.match(/https?:\/\/[^\s|]+/);
    if (urlMatch) {
      cleanLink = urlMatch[0];
      // Pega apenas a URL base antes dos parâmetros (?)
      if (cleanLink.includes('?')) {
        cleanLink = cleanLink.split('?')[0];
      }
    } else {
      // Se não tem http, limpa a string removendo a chave se ela existir
      if (nfeKey) {
        // Tenta remover a chave do texto original (com ou sem espaços)
        cleanLink = linkString.replace(new RegExp(nfeKey.split('').join('\\s*')), '').trim();
      }
    }

    const rowArray = [
      '',                               // A: Vazio
      refuelData.date,                  // B: Data
      'Hyundai I-30',                   // C: Força o nome legível na planilha
      refuelData.odometer,              // D: Odômetro (Km)
      refuelData.distance,              // E: Distância (Km)
      refuelData.driveType,             // F: City/Road
      refuelData.spentFuel || 0,        // G: Combustível Consumido (L)
      refuelData.tankLiters || 53,      // H: Tanque (L) - TROCADO
      refuelData.fuelSupplied,          // I: Litros Abastecidos
      refuelData.gasStation,            // J: Posto
      refuelData.total,                 // K: Total
      refuelData.unitValue,             // L: Preço por Litro
      refuelData.consumption,           // M: Consumo
      refuelData.tankLevel || '',       // N: Nível Tanque
      '',                               // O: (Vazio para uso futuro)
      cleanLink,                        // P: Link da Nota Fiscal (QR Code Limpo)
      nfeKey                            // Q: Chave de acesso
    ];

    await sheet.addRow(rowArray);
    console.log('Linha adicionada com sucesso!');
    return { success: true };
  } catch (error: any) {
    console.error('ERRO NO APPEND:', error.message);
    return { success: false, error: error.message };
  }
}

export async function getRefuelsFromSheets() {
  try {
    console.log('Iniciando getRefuelsFromSheets...');
    const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    
    const auth = getAuth();
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID!, auth);
    
    await doc.loadInfo();
    console.log('Planilha carregada para leitura:', doc.title);

    let sheet = doc.sheetsByTitle['Combustível'];
    if (!sheet) sheet = doc.sheetsByIndex[0];

    const rows = await sheet.getRows();
    console.log('Total de linhas brutas lidas:', rows.length);
    
    if (rows.length > 0) {
      console.log('Exemplo da primeira linha (bruta):', (rows[0] as any)._rawData);
    }

    const refuels = rows
      .filter((row: any) => {
        const data = row._rawData;
        // Agora apenas a Data (B) é obrigatória para considerar a linha válida
        return data && data[1];
      })
      .map((row: any, index) => {
        const data = row._rawData;
        // Se o nome na planilha for similar a Hyundai ou estiver VAZIO, mapeia para o ID interno
        let vId = data[2] || '';
        const lowerName = vId.toLowerCase();
        if (lowerName.includes('hyundai') || lowerName.includes('i30') || lowerName.includes('i-30') || !vId) {
          vId = 'hyundai-i30';
        }

        return {
          id: index + 1000,
          date: parseBrazilianDate(data[1]), // B: Data (corrigido)
          vehicleId: vId,
          odometer: parseNumber(data[3]),
          distance: parseNumber(data[4]),
          driveType: data[5] || 'City',
          spentFuel: parseNumber(data[6]),
          tankLiters: parseNumber(data[7]) || 53, // H: Tanque
          fuelSupplied: parseNumber(data[8]),
          gasStation: data[9] || '',
          total: parseNumber(data[10]),
          unitValue: parseNumber(data[11]),
          consumption: parseNumber(data[12]),
          tankLevel: data[13] || '',               // N: Nível
          photoBill: data[15] || '',               // P: Link da Nota
          nfeKey: data[16] || ''                   // Q: Chave de Acesso
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Ordenação decrescente direto na fonte

    console.log('Total de abastecimentos válidos convertidos:', refuels.length);
    return { success: true, data: refuels };
  } catch (error: any) {
    console.error('ERRO NA LEITURA:', error.message);
    return { success: false, error: error.message };
  }
}

export async function deleteRefuelFromSheets(date: string, odometer: number) {
  try {
    const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const auth = getAuth();
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID!, auth);
    await doc.loadInfo();
    
    let sheet = doc.sheetsByTitle['Combustível'];
    if (!sheet) sheet = doc.sheetsByIndex[0];

    const rows = await sheet.getRows();
    
    // Procura a linha que bate com a data e odômetro
    const rowToDelete = rows.find(r => {
      const data = (r as any)._rawData;
      if (!data) return false;

      // Formata a data da planilha para comparar (DD/MM/AAAA -> AAAA-MM-DD)
      const rawDate = String(data[1] || '').trim();
      let formattedSheetDate = rawDate;
      if (rawDate.includes('/')) {
        const parts = rawDate.split('/');
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
          formattedSheetDate = `${year}-${month}-${day}`;
        }
      }

      const sheetOdo = parseNumber(data[3]);
      
      // Compara a data formatada e o odômetro limpo
      return formattedSheetDate === date && sheetOdo === odometer;
    });

    if (rowToDelete) {
      await rowToDelete.delete();
      return { success: true };
    }
    return { success: false, error: 'Linha não encontrada na planilha' };
  } catch (error: any) {
    console.error('ERRO AO DELETAR NO SHEETS:', error.message);
    return { success: false, error: error.message };
  }
}
