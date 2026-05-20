'use server';

import { parseStringPromise } from 'xml2js';

export async function parseNfeData(url: string) {
  try {
    console.log('Buscando dados da NF-e na URL:', url);
    
    // Faz o fetch via servidor para evitar CORS
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao acessar URL da NF-e: ${response.statusText}`);
    }

    const text = await response.text();
    
    // Tenta parsear como XML (se o usuário disse xml2js, ele pode estar esperando um XML)
    // No entanto, muitas URLs de QR Code levam a páginas HTML.
    // Se for XML, o xml2js vai funcionar.
    try {
      const result = await parseStringPromise(text);
      console.log('XML parseado com sucesso');
      
      // Aqui teríamos que mapear os campos do XML da NF-e para o nosso formulário.
      // Como a estrutura varia por estado, vamos tentar pegar o básico se existir.
      // Exemplo hipotético:
      // const total = result.nfeProc?.NFe?.[0]?.infNFe?.[0]?.total?.[0]?.ICMSTot?.[0]?.vNF?.[0];
      
      return { success: true, raw: text, parsed: result };
    } catch (e) {
      console.log('Não é um XML válido, retornando texto bruto para processamento manual');
      return { success: true, raw: text, isHtml: true };
    }
  } catch (error: any) {
    console.error('Erro no parser da NF-e:', error.message);
    return { success: false, error: error.message };
  }
}
