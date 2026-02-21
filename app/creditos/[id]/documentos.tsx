import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import DocumentoList from '@/components/documentos/DocumentoList';
import UploadButton from '@/components/documentos/UploadButton';
import { Documento } from '@/types';
import { getDocumentosByCredito, createDocumento, deleteDocumento } from '@/lib/database';
import { colors, spacing } from '@/lib/theme';

export default function DocumentosCreditoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [documentos, setDocumentos] = useState<Documento[]>([]);

  const cargar = useCallback(async () => {
    if (!id) return;
    const docs = await getDocumentosByCredito(id);
    setDocumentos(docs);
  }, [id]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  async function handleUploaded(doc: Pick<Documento, 'nombre' | 'uri' | 'tipo' | 'tamano'>) {
    if (!id) return;
    await createDocumento({ creditoId: id, ...doc });
    cargar();
  }

  async function handleEliminar(doc: Documento) {
    Alert.alert('Eliminar documento', `¿Eliminar "${doc.nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try { await FileSystem.deleteAsync(doc.uri); } catch {}
          await deleteDocumento(doc.id);
          cargar();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.uploadRow}>
        {id && <UploadButton creditoId={id} onUploaded={handleUploaded} />}
      </View>
      <DocumentoList documentos={documentos} onEliminar={handleEliminar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.background },
  uploadRow: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.surface.border },
});
