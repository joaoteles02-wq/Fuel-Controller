'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

export async function parseReceiptFromImage(base64Image: string, mimeType: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'GEMINI_API_KEY is not configured on the server.' };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      Você é um especialista em ler notas fiscais de postos de combustível (NFC-e) do Brasil.
      Eu vou te enviar uma imagem de um cupom fiscal ou da tela da bomba de combustível.
      Você precisa analisar a imagem, ler os números de quantidade e preço, identificar o QR Code (e extrair o link da SEFAZ dele, se houver) e me devolver os dados ESTRITAMENTE num formato JSON válido, sem NENHUM texto adicional ou marcação Markdown.

      O formato JSON esperado é exatamente este:
      {
        "total": número decimal usando ponto (ex: 150.50),
        "liters": número decimal usando ponto (ex: 25.5),
        "unitPrice": número decimal usando ponto (ex: 5.90),
        "gasStation": "string com o Nome Fantasia do posto, ou null",
        "nfeLink": "string com a URL da SEFAZ extraída do QR Code, ou null se não houver"
      }
      
      Regras:
      1. Se o valor total for "R$ 150,50", retorne 150.50 (número puro).
      2. Se um campo não for encontrado ou não for legível, retorne null para ele.
      3. Apenas retorne o JSON! Nada de \`\`\`json no início.
    `;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text().trim();
    
    // Clean up markdown markers if present
    if (text.startsWith('```json')) {
      text = text.substring(7);
    }
    if (text.startsWith('```')) {
      text = text.substring(3);
    }
    if (text.endsWith('```')) {
      text = text.substring(0, text.length - 3);
    }
    
    const data = JSON.parse(text.trim());
    
    return { success: true, data };
    
  } catch (error: any) {
    console.error("Error parsing receipt with Gemini:", error);
    return { success: false, error: error.message || 'Failed to analyze the receipt.' };
  }
}
