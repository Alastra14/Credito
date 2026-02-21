import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { CreditoConPagos } from '@/types';
import { colors, fontSize, spacing, borderRadius, shadow } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';

const SCREEN_W = Dimensions.get('window').width;

const PALETTE = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
];

interface Props {
  creditos: CreditoConPagos[];
}

export default function DeudaPieChart({ creditos }: Props) {
  if (creditos.length === 0) return null;

  // Agrupar por tipo
  const porTipo: Record<string, number> = {};
  for (const c of creditos) {
    porTipo[c.tipo] = (porTipo[c.tipo] ?? 0) + c.saldoActual;
  }

  const TIPO_LABEL: Record<string, string> = {
    tarjeta_credito: 'Tarjeta',
    hipoteca: 'Hipoteca',
    auto: 'Auto',
    personal: 'Personal',
    otro: 'Otro',
  };

  const chartData = Object.entries(porTipo).map(([tipo, saldo], i) => ({
    name: TIPO_LABEL[tipo] ?? tipo,
    population: saldo,
    color: PALETTE[i % PALETTE.length],
    legendFontColor: colors.text.secondary,
    legendFontSize: 12,
  }));

  const total = Object.values(porTipo).reduce((a, b) => a + b, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Deuda por tipo</Text>
      <Text style={styles.total}>{formatCurrency(total)} total</Text>
      <PieChart
        data={chartData}
        width={SCREEN_W - spacing.md * 2 - 32}
        height={200}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="12"
        chartConfig={{
          color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
          labelColor: () => colors.text.secondary,
        }}
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
  },
  total: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  chart: {
    borderRadius: borderRadius.md,
  },
});
