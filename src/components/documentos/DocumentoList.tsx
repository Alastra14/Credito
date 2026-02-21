import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Documento } from '@/types';
import { spacing, borderRadius, fontSize, shadow } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { formatDate, formatFileSize } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import AppModal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface Props {
  documentos: Documento[];
  onEliminar: (doc: Documento) => void;
}

function mimeIcon(tipo: string): string {
  if (tipo.includes('pdf')) return 'document-text-outline';
  if (tipo.includes('image')) return 'image-outline';
  if (tipo.includes('word') || tipo.includes('document')) return 'document-outline';
  if (tipo.includes('sheet') || tipo.includes('excel')) return 'grid-outline';
  return 'attach-outline';
}

export default function DocumentoList({ documentos, onEliminar }: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { showToast } = useToast();
  const [docToDelete, setDocToDelete] = useState<Documento | null>(null);

  if (documentos.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="folder-open-outline" size={36} color={colors.text.disabled} />
        <Text style={styles.emptyText}>Sin documentos adjuntos</Text>
      </View>
    );
  }

  function handleOpen(doc: Documento) {
    Linking.openURL(doc.uri).catch(() =>
      showToast({
        title: 'Error',
        message: 'No se pudo abrir el archivo',
        type: 'error'
      })
    );
  }

  function handleDelete(doc: Documento) {
    setDocToDelete(doc);
  }

  function confirmDelete() {
    if (docToDelete) {
      onEliminar(docToDelete);
      setDocToDelete(null);
    }
  }

  return (
    <>
      <FlatList
        data={documentos}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.fila} onPress={() => handleOpen(item)} activeOpacity={0.75}>
            <View style={styles.iconBox}>
              <Ionicons name={mimeIcon(item.tipo) as any} size={22} color={colors.primary.default} />
            </View>
            <View style={styles.info}>
              <Text style={styles.nombre} numberOfLines={1}>{item.nombre}</Text>
              <Text style={styles.meta}>
                {formatFileSize(item.tamano)} · {formatDate(item.creadoEn)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={18} color={colors.destructive.default} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      <AppModal
        visible={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        title="Eliminar documento"
      >
        <Text style={styles.modalText}>
          ¿Deseas eliminar "{docToDelete?.nombre}"?
        </Text>
        <View style={styles.modalActions}>
          <Button 
            variant="outline" 
            onPress={() => setDocToDelete(null)}
            style={styles.modalBtn}
          >
            Cancelar
          </Button>
          <Button 
            onPress={confirmDelete}
            style={[styles.modalBtn, { backgroundColor: colors.destructive.default }]}
          >
            Eliminar
          </Button>
        </View>
      </AppModal>
    </>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
  lista: { gap: spacing.md },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    padding: spacing.md,
    gap: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadow.sm,
  },
  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: colors.surface.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  info: { flex: 1 },
  nombre: {
    fontSize: fontSize.md,
    fontWeight: '900',
    color: colors.text.primary,
    textTransform: 'uppercase',
  },
  meta: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    marginTop: 4,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '900',
    textTransform: 'uppercase',
  },  modalText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalBtn: {
    flex: 1,
  },});
}
