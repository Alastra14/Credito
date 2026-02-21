import React, { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import DocumentoList from '@/components/documentos/DocumentoList';
import UploadButton from '@/components/documentos/UploadButton';
import { Documento } from '@/types';
import { getDocumentosByCredito, createDocumento, deleteDocumento } from '@/lib/database';
import { spacing } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { useToast } from '@/components/ui/Toast';

export default function DocumentosCreditoScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const { showToast } = useToast();

  const cargar = useCallback(async () => {
    if (!id) return;
    const docs = await getDocumentosByCredito(id);
    setDocumentos(docs);
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  async function handleUploaded(doc: Pick<Documento, 'nombre' | 'uri' | 'tipo' | 'tamano'>) {
    if (!id) return;
    await createDocumento({ creditoId: id, ...doc });
    showToast({
      title: 'Documento subido',
      message: 'El documento se ha guardado correctamente.',
      type: 'success'
    });
    cargar();
  }

  async function handleEliminar(doc: Documento) {
    try { await FileSystem.deleteAsync(doc.uri); } catch {}
    await deleteDocumento(doc.id);
    showToast({
      title: 'Documento eliminado',
      message: 'El documento ha sido eliminado.',
      type: 'info'
    });
    cargar();
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

function getStyles(colors: any) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.background },
  uploadRow: { padding: spacing.md, borderBottomWidth: 2, borderBottomColor: colors.text.primary },
});
}
