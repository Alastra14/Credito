import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Documento } from '@/types';
import { colors, spacing, borderRadius, fontSize, shadow } from '@/lib/theme';
import { formatDate, formatFileSize } from '@/lib/utils';

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
      Alert.alert('Error', 'No se pudo abrir el archivo')
    );
  }

  function handleDelete(doc: Documento) {
    Alert.alert(
      'Eliminar documento',
      `¿Deseas eliminar "${doc.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => onEliminar(doc) },
      ]
    );
  }

  return (
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
  );
}

const styles = StyleSheet.create({
  lista: { gap: spacing.xs },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    gap: spacing.sm,
    ...shadow.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  nombre: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text.primary,
  },
  meta: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
  },
});
