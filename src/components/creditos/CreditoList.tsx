import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CreditoCard from './CreditoCard';
import { CreditoConPagos, TipoCredito, EstadoCredito } from '@/types';
import { TIPOS_CREDITO, ESTADOS_CREDITO } from '@/lib/constants';
import { colors, spacing, borderRadius, fontSize } from '@/lib/theme';

interface Props {
  creditos: CreditoConPagos[];
  onSelect: (credito: CreditoConPagos) => void;
  onNuevo?: () => void;
}

export default function CreditoList({ creditos, onSelect, onNuevo }: Props) {
  const [filtroTipo, setFiltroTipo] = useState<TipoCredito | 'todos'>('todos');
  const [filtroEstado, setFiltroEstado] = useState<EstadoCredito | 'todos'>('todos');

  const filtrados = creditos.filter(c => {
    if (filtroTipo !== 'todos' && c.tipo !== filtroTipo) return false;
    if (filtroEstado !== 'todos' && c.estado !== filtroEstado) return false;
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Filtros de tipo */}
      <View>
        <FlatList
          horizontal
          data={[{ value: 'todos', label: 'Todos', icon: 'apps-outline' }, ...TIPOS_CREDITO]}
          keyExtractor={item => item.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          renderItem={({ item }) => {
            const activo = filtroTipo === item.value;
            return (
              <TouchableOpacity
                onPress={() => setFiltroTipo(item.value as TipoCredito | 'todos')}
                style={[styles.chip, activo && styles.chipActivo]}
              >
                <Ionicons
                  name={(item.icon ?? 'help-outline') as any}
                  size={14}
                  color={activo ? '#fff' : colors.text.secondary}
                />
                <Text style={[styles.chipLabel, activo && styles.chipLabelActivo]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Filtros de estado */}
      <View>
        <FlatList
          horizontal
          data={[{ value: 'todos', label: 'Todos' }, ...ESTADOS_CREDITO]}
          keyExtractor={item => item.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          renderItem={({ item }) => {
            const activo = filtroEstado === item.value;
            return (
              <TouchableOpacity
                onPress={() => setFiltroEstado(item.value as EstadoCredito | 'todos')}
                style={[styles.chip, styles.chipPequeno, activo && styles.chipActivo]}
              >
                <Text style={[styles.chipLabel, activo && styles.chipLabelActivo]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="wallet-outline" size={48} color={colors.text.disabled} />
          <Text style={styles.emptyTitle}>Sin créditos</Text>
          <Text style={styles.emptyDesc}>
            {creditos.length === 0
              ? 'Agrega tu primer crédito para comenzar'
              : 'Ningún crédito coincide con los filtros'}
          </Text>
          {creditos.length === 0 && onNuevo && (
            <TouchableOpacity onPress={onNuevo} style={styles.emptyBtn}>
              <Ionicons name="add-circle-outline" size={16} color={colors.primary.default} />
              <Text style={styles.emptyBtnLabel}>Agregar crédito</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtrados}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <CreditoCard credito={item} onPress={() => onSelect(item)} />
          )}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chips: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface.muted,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  chipPequeno: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  chipActivo: {
    backgroundColor: colors.primary.default,
  },
  chipLabel: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  chipLabelActivo: {
    color: '#fff',
  },
  lista: {
    padding: spacing.md,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  emptyDesc: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    textAlign: 'center',
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary.default,
    borderRadius: borderRadius.md,
  },
  emptyBtnLabel: {
    fontSize: fontSize.sm,
    color: colors.primary.default,
    fontWeight: '600',
  },
});
