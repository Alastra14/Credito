import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EstrategiaDetalle } from '@/types';
import { spacing, borderRadius, fontSize, shadow } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { formatCurrency } from '@/lib/utils';

interface Props {
  estrategia: EstrategiaDetalle;
  esRecomendada?: boolean;
}

export default function EstrategiaCard({ estrategia, esRecomendada }: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
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

function getStyles(colors: any) {
  return StyleSheet.create({
  container: {
    backgroundColor: colors.surface.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    ...shadow.md,
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
    backgroundColor: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  badgeLabel: {
    fontSize: 10,
    color: colors.surface.background,
    fontWeight: '900',
    letterSpacing: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nombre: {
    fontSize: fontSize.xl,
    fontWeight: '900',
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  descripcion: {
    fontSize: 11,
    color: colors.text.secondary,
    maxWidth: 220,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.background,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValor: {
    fontSize: fontSize.md,
    fontWeight: '900',
    color: colors.text.primary,
    letterSpacing: -0.5,
   fontFamily: 'SpaceGrotesk_700Bold',},
  statLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  separador: {
    width: 2,
    height: 32,
    backgroundColor: colors.surface.border,
  },
  orden: {
    gap: spacing.sm,
  },
  ordenTitulo: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  ordenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  numBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBadgeLabel: {
    fontSize: 11,
    color: colors.surface.background,
    fontWeight: '900',
  },
  ordenNombre: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    flex: 1,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
}
