import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EstrategiaDetalle } from '@/types';
import { colors, spacing, borderRadius, fontSize, shadow } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';

interface Props {
  estrategia: EstrategiaDetalle;
  esRecomendada?: boolean;
}

export default function EstrategiaCard({ estrategia, esRecomendada }: Props) {
  const esAvalanche = estrategia.nombre === 'Avalancha';

  return (
    <View style={[styles.container, esRecomendada && styles.containerDestacado]}>
      {esRecomendada && (
        <View style={styles.badge}>
          <Ionicons name="star" size={12} color="#fff" />
          <Text style={styles.badgeLabel}>RECOMENDADA</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: esAvalanche ? colors.destructive.light : colors.info.light }]}>
          <Ionicons
            name={esAvalanche ? 'trending-down-outline' : 'snow-outline'}
            size={24}
            color={esAvalanche ? colors.destructive.default : colors.info.default}
          />
        </View>
        <View>
          <Text style={styles.nombre}>{estrategia.nombre}</Text>
          <Text style={styles.descripcion}>
            {esAvalanche
              ? 'Paga primero la deuda con mayor tasa'
              : 'Paga primero la deuda con menor saldo'}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValor}>{estrategia.mesesTotal}</Text>
          <Text style={styles.statLabel}>meses</Text>
        </View>
        <View style={styles.separador} />
        <View style={styles.stat}>
          <Text style={styles.statValor}>{formatCurrency(estrategia.interesTotal)}</Text>
          <Text style={styles.statLabel}>intereses totales</Text>
        </View>
        <View style={styles.separador} />
        <View style={styles.stat}>
          <Text style={styles.statValor}>{formatCurrency(estrategia.costoTotal)}</Text>
          <Text style={styles.statLabel}>costo total</Text>
        </View>
      </View>

      <View style={styles.orden}>
        <Text style={styles.ordenTitulo}>Orden de pago:</Text>
        {estrategia.ordenCreditos.map((nombre, i) => (
          <View key={i} style={styles.ordenItem}>
            <View style={[styles.numBadge, { backgroundColor: esAvalanche ? colors.destructive.default : colors.info.default }]}>
              <Text style={styles.numBadgeLabel}>{i + 1}</Text>
            </View>
            <Text style={styles.ordenNombre} numberOfLines={1}>{nombre}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  containerDestacado: {
    borderColor: colors.primary.default,
    borderWidth: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary.default,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginBottom: spacing.sm,
  },
  badgeLabel: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nombre: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text.primary,
  },
  descripcion: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    maxWidth: 220,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.muted,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValor: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.text.muted,
    textAlign: 'center',
  },
  separador: {
    width: 1,
    height: 32,
    backgroundColor: colors.surface.border,
  },
  orden: {
    gap: spacing.xs,
  },
  ordenTitulo: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 2,
  },
  ordenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  numBadge: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBadgeLabel: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
  },
  ordenNombre: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    flex: 1,
  },
});
