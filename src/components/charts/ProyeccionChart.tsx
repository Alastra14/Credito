import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ProyeccionCredito } from '@/types';
import { fontSize, spacing, borderRadius, shadow } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { formatCurrency } from '@/lib/utils';

const SCREEN_W = Dimensions.get('window').width;

const LINE_COLORS = [
  (op = 1) => `rgba(99, 102, 241, ${op})`,
  (op = 1) => `rgba(245, 158, 11, ${op})`,
  (op = 1) => `rgba(16, 185, 129, ${op})`,
  (op = 1) => `rgba(239, 68, 68, ${op})`,
  (op = 1) => `rgba(59, 130, 246, ${op})`,
];

interface Props {
  proyecciones: ProyeccionCredito[];
}

export default function ProyeccionChart({ proyecciones }: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  if (proyecciones.length === 0) return null;

  const maxMeses = Math.max(...proyecciones.map(p => p.meses.length));
  // Samplear hasta 12 puntos para no saturar el eje X
  const step = Math.max(1, Math.floor(maxMeses / 12));
  const indices: number[] = [];
  for (let i = 0; i < maxMeses; i += step) indices.push(i);
  if (indices[indices.length - 1] !== maxMeses - 1) indices.push(maxMeses - 1);

  const labels = indices.map(i => `M${i + 1}`);

  const datasets = proyecciones.slice(0, 5).map((p, idx) => ({
    data: indices.map(i => p.meses[i]?.saldoFinal ?? 0),
    color: LINE_COLORS[idx % LINE_COLORS.length],
    strokeWidth: 2,
  }));

  const legend = proyecciones.slice(0, 5).map(p => p.nombre);

  const chartConfig = {
    backgroundColor: colors.surface.card,
    backgroundGradientFrom: colors.surface.card,
    backgroundGradientTo: colors.surface.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: () => colors.text.secondary,
    propsForDots: { r: '3' },
    propsForBackgroundLines: { stroke: colors.surface.border },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Proyección de saldos</Text>

      <LineChart
        data={{ labels, datasets, legend }}
        width={SCREEN_W - spacing.md * 2 - 32}
        height={240}
        chartConfig={chartConfig}
        bezier
        withDots={false}
        formatYLabel={v => {
          const n = Number(v);
          if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
          if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
          return `$${n}`;
        }}
        style={styles.chart}
      />

      {/* Leyenda personalizada */}
      <View style={styles.leyenda}>
        {proyecciones.slice(0, 5).map((p, i) => (
          <View key={p.id} style={styles.leyendaItem}>
            <View style={[styles.leyendaDot, { backgroundColor: ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'][i] }]} />
            <Text style={styles.leyendaLabel} numberOfLines={1}>{p.nombre}</Text>
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
  leyenda: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: spacing.sm,
  },
  leyendaDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  leyendaLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    maxWidth: 90,
  },
});
}
