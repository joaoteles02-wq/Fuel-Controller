import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseString } from 'xml2js';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nfeData, setNfeData] = useState<any>(null);
  const [savedRecords, setSavedRecords] = useState<any[]>([]);

  useEffect(() => {
    loadSavedRecords();
  }, []);

  const loadSavedRecords = async () => {
    try {
      const records = await AsyncStorage.getItem('@nfe_records');
      if (records) {
        setSavedRecords(JSON.parse(records));
      }
    } catch (e) {
      console.error('Erro ao carregar registros:', e);
    }
  };

  const handleScan = async ({ type, data }: { type: string; data: string }) => {
    if (scanning) {
      setScanning(false);
      setLoading(true);

      try {
        console.log('QR Code escaneado:', data);
        
        // 1. Faz o fetch da URL do QR Code
        const response = await fetch(data);
        const text = await response.text();

        // 2. Faz o parse do XML com xml2js
        parseString(text, async (err: any, result: any) => {
          if (err) {
            console.error('Erro no parse do XML, tentando extrair via regex...');
            // Fallback caso a Sefaz retorne HTML em vez de XML direto
            fallbackRegexParse(data, text);
            return;
          }

          // Mapeamento básico assumindo estrutura padrão de NF-e
          const nfeInfo = result?.nfeProc?.NFe?.[0]?.infNFe?.[0];
          const valorTotal = nfeInfo?.total?.[0]?.ICMSTot?.[0]?.vNF?.[0] || '0.00';
          const posto = nfeInfo?.emit?.[0]?.xNome?.[0] || 'Desconhecido';

          const record = {
            id: Date.now().toString(),
            url: data,
            valor: valorTotal,
            posto: posto,
            data: new Date().toLocaleDateString('pt-BR'),
          };

          await saveRecord(record);
        });

      } catch (error) {
        Alert.alert('Erro', 'Não foi possível buscar os dados da NF-e.');
        setLoading(false);
      }
    }
  };

  const fallbackRegexParse = async (url: string, html: string) => {
    // Tenta extrair vNF da URL
    const urlObj = new URL(url);
    const vNF = urlObj.searchParams.get('vNF') || '0.00';
    
    const record = {
      id: Date.now().toString(),
      url: url,
      valor: vNF,
      posto: 'Posto (Extraído da URL)',
      data: new Date().toLocaleDateString('pt-BR'),
    };

    await saveRecord(record);
  };

  const saveRecord = async (record: any) => {
    try {
      const newRecords = [record, ...savedRecords];
      await AsyncStorage.setItem('@nfe_records', JSON.stringify(newRecords));
      setSavedRecords(newRecords);
      setNfeData(record);
      setLoading(false);
      Alert.alert('Sucesso', 'Nota fiscal salva com sucesso!');
    } catch (e) {
      console.error('Erro ao salvar:', e);
      setLoading(false);
    }
  };

  if (!permission) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#4dabff" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fuel Controller</Text>

      {/* Botão Neumórfico para Escanear */}
      <TouchableOpacity 
        style={styles.neumorphicButton} 
        onPress={() => {
          if (!permission.granted) {
            requestPermission();
          } else {
            setScanning(true);
            setNfeData(null);
          }
        }}
      >
        <Text style={styles.buttonText}>📷 Escanear Nota</Text>
      </TouchableOpacity>

      {/* Status de Carregamento */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4dabff" />
          <Text style={styles.loadingText}>Processando NF-e...</Text>
        </View>
      )}

      {/* Dados da NF-e Atual */}
      {nfeData && (
        <View style={styles.neumorphicCard}>
          <Text style={styles.cardTitle}>Última Nota Lida ✅</Text>
          <Text style={styles.cardText}>Posto: {nfeData.posto}</Text>
          <Text style={styles.cardText}>Valor: R$ {nfeData.valor}</Text>
          <Text style={styles.cardText}>Data: {nfeData.data}</Text>
        </View>
      )}

      {/* Histórico */}
      <ScrollView style={styles.historyContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.historyTitle}>Histórico de Notas</Text>
        {savedRecords.map(item => (
          <View key={item.id} style={styles.neumorphicCardSmall}>
            <Text style={styles.cardTextSmall}>🏬 {item.posto}</Text>
            <Text style={styles.cardTextSmall}>💰 R$ {item.valor} | 📅 {item.data}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Modal do Scanner da Câmera */}
      <Modal visible={scanning} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Aponte para o QR Code</Text>
            <TouchableOpacity onPress={() => setScanning(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
          
          <CameraView
            style={styles.camera}
            facing="environment"
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'pdf417'],
            }}
            onBarcodeScanned={handleScan}
          >
            <View style={styles.overlay}>
              <View style={styles.scanFrame} />
            </View>
          </CameraView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0e5ec', // Fundo Neumórfico típico (cinza claro/azulado)
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 40,
  },
  neumorphicButton: {
    backgroundColor: '#e0e5ec',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 20,
    // Sombras Neumórficas (iOS)
    shadowColor: '#a3b1c6',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    // Sombras Neumórficas (Android usa elevation, mas é limitado. No Expo usa-se sombras compostas)
    elevation: 8,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4dabff', // Azul solicitado anteriormente
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#64748b',
  },
  neumorphicCard: {
    backgroundColor: '#e0e5ec',
    width: '100%',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#a3b1c6',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#ffffff',
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 5,
  },
  historyContainer: {
    flex: 1,
    width: '100%',
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 15,
  },
  neumorphicCardSmall: {
    backgroundColor: '#e0e5ec',
    width: '100%',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#a3b1c6',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ffffff',
    marginBottom: 15,
  },
  cardTextSmall: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 3,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1e293b',
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#4dabff',
    backgroundColor: 'transparent',
  }
});
