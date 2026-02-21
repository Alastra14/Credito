import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import TasasChart from '@/components/charts/TasasChart';
import DeudaPieChart from '@/components/charts/DeudaPieChart';
import ProgresoChart from '@/components/charts/ProgresoChart';
import ProyeccionChart from '@/components/charts/ProyeccionChart';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { CreditoConPagos, ProyeccionCredito } from '@/types';
import { getCreditos } from '@/lib/database';
import { calcularProyeccion } from '@/lib/calculos/proyeccion';
import { colors, spacing, fontSize } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';

export default function ReportesScreen() {
  const [creditos, setCreditos] = useState<CreditoConPagos[]>([]);
  const [proyecciones, setProyecciones] = useState<ProyeccionCredito[]>([]);

  const cargar = useCallback(async () => {
    const cs = await getCreditos();
    const activos = cs.filter(c => c.estado === 'activo') as CreditoConPagos[];
    setCreditos(activos);
    if (activos.length > 0) {
      setProyecciones(activos.slice(0, 5).map(c => calcularProyeccion(c)));
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const totalDeuda = creditos.reduce((acc, c) => acc + c.saldoActual, 0);
  const tasaPromedio =
    creditos.length > 0
      ? creditos.reduce((acc, c) => acc + c.tasaAnual, 0) / creditos.length
      : 0;

  if (creditos.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Sin datos disponibles</Text>
        <Text style={styles.emptySubtitle}>Agrega créditos para ver los reportes.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Resumen general */}
      <Card style={styles.card}>
        <CardHeader title="Resumen general" />
        <CardContent>
          <View style={styles.summaryRow}>
            <SummaryItem label="Deuda total" value={formatCurrency(totalDeuda)} />
            <SummaryItem label="Créditos activos" value={`${creditos.length}`} />
            <SummaryItem label="Tasa promedio" value={`${tasaPromedio.toFixed(1)}%`} />
          </View>
        </CardContent>
      </Card>

      {/* Por tipo de deuda */}
      <Card style={styles.card}>
        <CardHeader title="Distribución por tipo" />
        <CardContent>
          <DeudaPieChart creditos={creditos} />
        </CardContent>
      </Card>

      {/* Tasas de interés */}
      <Card style={styles.card}>
        <CardHeader title="Tasas de interés" />
        <CardContent>
          <TasasChart creditos={creditos} />
        </CardContent>
      </Card>

      {/* Progreso de pagos */}
      <Card style={styles.card}>
        <CardHeader title="Progreso de pagos" />
        <CardContent>
          <ProgresoChart creditos={creditos} />
        </CardContent>
      </Card>

      {/* Proyección de saldos */}
      {proyecciones.length > 0 && (
        <Card style={styles.card}>
          <CardHeader title="Proyección de saldos (5 créditos)" />
          <CardContent>
            <ProyeccionChart proyecciones={proyecciones} />
          </CardContent>
        </Card>
      )}
    </ScrollView>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={summaryStyles.item}>
      <Text style={summaryStyles.value}>{value}</Text>
      <Text style={summaryStyles.label}>{label}</Text>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  item: { flex: 1, alignItems: 'center' },
  value: { fontSize: fontSize.lg, fontWeight: '700', color: colors.primary.default },
  label: { fontSize: fontSize.xs, color: colors.text.muted, textAlign: 'center' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.background },
  content: { padding: spacing.md, gap: spacing.sm },
  card: { marginBottom: 0 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.surface.background,
  },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text.secondary },
  emptySubtitle: { fontSize: fontSize.sm, color: colors.text.muted },
});
