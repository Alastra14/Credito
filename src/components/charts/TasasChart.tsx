import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { CreditoConPagos } from '@/types';
import { colors, fontSize, spacing, borderRadius, shadow } from '@/lib/theme';

const SCREEN_W = Dimensions.get('window').width;

interface Props {
  creditos: CreditoConPagos[];
}

export default function TasasChart({ creditos }: Props) {
  if (creditos.length === 0) return null;

  const sorted = [...creditos].sort((a, b) => b.tasaAnual - a.tasaAnual).slice(0, 8);

  const data = {
    labels: sorted.map(c =>
      c.nombre.length > 7 ? c.nombre.slice(0, 7) + '…' : c.nombre
    ),
    datasets: [{ data: sorted.map(c => c.tasaAnual) }],
  };

  const chartConfig = {
    backgroundColor: colors.surface.card,
    backgroundGradientFrom: colors.surface.card,
    backgroundGradientTo: colors.surface.card,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: () => colors.text.secondary,
    style: { borderRadius: 8 },
    propsForBackgroundLines: { stroke: colors.surface.border },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Tasa anual por crédito (%)</Text>
      <BarChart
        data={data}
        width={SCREEN_W - spacing.md * 2 - 32}
        height={220}
        yAxisLabel=""
        yAxisSuffix="%"
        chartConfig={chartConfig}
        fromZero
        showValuesOnTopOfBars
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
