import React, { useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CreditoCard from './CreditoCard';
import Input from '../ui/Input';
import { CreditoConPagos, TipoCredito, EstadoCredito } from '@/types';
import { TIPOS_CREDITO, ESTADOS_CREDITO } from '@/lib/constants';
import { spacing, borderRadius, fontSize, shadow } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

import { useScrollHideTabBar } from '@/lib/useScrollHideTabBar';

interface Props {
  creditos: CreditoConPagos[];
  onSelect: (credito: CreditoConPagos) => void;
  onNuevo?: () => void;
}

export default function CreditoList({ creditos, onSelect, onNuevo }: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [filtroTipo, setFiltroTipo] = useState<TipoCredito | 'todos'>('todos');
  const [filtroEstado, setFiltroEstado] = useState<EstadoCredito | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const { onScroll, onTouchStart, onTouchEnd, scrollEventThrottle } = useScrollHideTabBar();

  const filtrados = creditos.filter(c => {
    if (filtroTipo !== 'todos' && c.tipo !== filtroTipo) return false;
    if (filtroEstado !== 'todos' && c.estado !== filtroEstado) return false;
    if (busqueda.trim() !== '') {
      const term = busqueda.toLowerCase();
      const matchNombre = c.nombre.toLowerCase().includes(term);
      const matchInstitucion = c.institucion?.toLowerCase().includes(term);
      if (!matchNombre && !matchInstitucion) return false;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Buscador y Botón Agregar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <Input
              placeholder="Buscar crédito..."
              value={busqueda}
              onChangeText={setBusqueda}
              containerStyle={styles.searchInput}
            />
          </View>
          {onNuevo && (
            <TouchableOpacity style={styles.addButton} onPress={onNuevo}>
              <Ionicons name="add" size={28} color={colors.text.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

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
                  size={16}
                  color={activo ? colors.text.inverse : colors.text.primary}
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
          onScroll={onScroll}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          scrollEventThrottle={scrollEventThrottle}
        />
      )}
    </View>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchInputWrapper: {
    flex: 1,
  },
  searchInput: {
    marginBottom: 0,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.text.primary,
    ...shadow.sm,
  },
  chips: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface.card,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    ...shadow.sm,
  },
  chipPequeno: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  chipActivo: {
    backgroundColor: colors.text.primary,
    borderColor: colors.text.primary,
  },
  chipLabel: {
    fontSize: 11,
    color: colors.text.primary,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  chipLabelActivo: {
    color: colors.surface.background,
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
    fontWeight: '900',
    color: colors.text.primary,
    textTransform: 'uppercase',
  },
  emptyDesc: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderColor: colors.text.primary,
    backgroundColor: colors.primary.default,
  },
  emptyBtnLabel: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
}
