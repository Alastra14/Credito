import React, { useCallback, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import TasasChart from '@/components/charts/TasasChart';
import DeudaPieChart from '@/components/charts/DeudaPieChart';
import ProgresoChart from '@/components/charts/ProgresoChart';
import ProyeccionChart from '@/components/charts/ProyeccionChart';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { CreditoConPagos, ProyeccionCredito } from '@/types';
import { getCreditosConPagos } from '@/lib/database';
import { calcularProyeccion } from '@/lib/calculos/proyeccion';
import { spacing, fontSize } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { formatCurrency } from '@/lib/utils';
import { useScrollHideTabBar } from '@/lib/useScrollHideTabBar';
import { useToast } from '@/components/ui/Toast';

export default function ReportesScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [creditos, setCreditos] = useState<CreditoConPagos[]>([]);
  const [proyecciones, setProyecciones] = useState<ProyeccionCredito[]>([]);
  const viewShotRef = useRef<ViewShot>(null);
  const { onScroll, onTouchStart, onTouchEnd, scrollEventThrottle } = useScrollHideTabBar();
  const { showToast } = useToast();

  const cargar = useCallback(async () => {
    const cs = await getCreditosConPagos();
    const activos = cs.filter(c => c.estado === 'activo');
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

  const handleShare = async () => {
    try {
      if (!viewShotRef.current?.capture) return;
      const uri = await viewShotRef.current.capture();
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Compartir Reporte de Créditos',
        });
      } else {
        showToast({
          title: 'Error',
          message: 'La opción de compartir no está disponible en este dispositivo.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error(error);
      showToast({
        title: 'Error',
        message: 'No se pudo generar la imagen del reporte.',
        type: 'error'
      });
    }
  };

  if (creditos.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Sin datos disponibles</Text>
        <Text style={styles.emptySubtitle}>Agrega créditos para ver los reportes.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        onScroll={onScroll}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        scrollEventThrottle={scrollEventThrottle}
      >
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }} style={styles.viewShotContainer}>
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
        </ViewShot>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleShare}>
        <Ionicons name="share-social" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  const summaryStyles = getSummaryStyles(colors);
  return (
    <View style={summaryStyles.item}>
      <Text style={summaryStyles.value}>{value}</Text>
      <Text style={summaryStyles.label}>{label}</Text>
    </View>
  );
}

function getSummaryStyles(colors: any) {
  return StyleSheet.create({
  item: { flex: 1, alignItems: 'center' },
  value: { fontSize: fontSize.xl, fontWeight: '900', color: colors.text.primary, letterSpacing: -0.5, fontFamily: 'SpaceGrotesk_700Bold' },
  label: { fontSize: 10, color: colors.text.secondary, textAlign: 'center', fontWeight: '800', textTransform: 'uppercase', marginTop: 4 },
});
}

function getStyles(colors: any) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.background },
  content: { padding: spacing.lg, gap: spacing.md },
  card: { marginBottom: 0 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md,
    backgroundColor: colors.surface.background,
  },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: '900', color: colors.text.secondary, textTransform: 'uppercase' },
  emptySubtitle: { fontSize: fontSize.sm, color: colors.text.secondary, fontWeight: '600' },
  viewShotContainer: {
    backgroundColor: colors.surface.background,
    gap: spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface.inverse,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary.default,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
}
