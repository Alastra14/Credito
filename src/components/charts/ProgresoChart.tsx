import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ProgressChart } from 'react-native-chart-kit';
import { CreditoConPagos } from '@/types';
import { colors, fontSize, spacing, borderRadius, shadow } from '@/lib/theme';

const SCREEN_W = Dimensions.get('window').width;

interface Props {
  creditos: CreditoConPagos[];
}

export default function ProgresoChart({ creditos }: Props) {
  const activos = creditos
    .filter(c => c.plazoMeses && c.plazoMeses > 0)
    .slice(0, 6); // máximo 6 barras

  if (activos.length === 0) return null;

  const datos = activos.map(c => {
    const pagados = c.pagos.filter(p => p.estado === 'pagado').length;
    return Math.min(1, pagados / (c.plazoMeses ?? 1));
  });

  const chartData = {
    labels: activos.map(c =>
      c.nombre.length > 7 ? c.nombre.slice(0, 7) + '…' : c.nombre
    ),
    data: datos,
  };

  const chartConfig = {
    backgroundColor: colors.surface.card,
    backgroundGradientFrom: colors.surface.card,
    backgroundGradientTo: colors.surface.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: () => colors.text.secondary,
    style: { borderRadius: 8 },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Progreso de pagos (%)</Text>
      <ProgressChart
        data={chartData}
        width={SCREEN_W - spacing.md * 2 - 32}
        height={220}
        strokeWidth={12}
        radius={28}
        chartConfig={chartConfig}
        hideLegend={false}
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadow.md,
    marginBottom: spacing.sm,
  },
  titulo: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  chart: {
    borderRadius: borderRadius.md,
  },
});
