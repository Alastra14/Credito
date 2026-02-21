import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CreditoConPagos } from '@/types';
import { getCreditos, getCreditoById } from '@/lib/database';
import { colors, spacing, borderRadius, fontSize, shadow } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';
import { MESES } from '@/lib/constants';

export default function DashboardScreen() {
  const [creditos, setCreditos] = useState<CreditoConPagos[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const lista = await getCreditos();
      const conPagos = await Promise.all(
        lista.map(c => getCreditoById(c.id))
      );
      setCreditos(conPagos.filter(Boolean) as CreditoConPagos[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargarDatos(); }, [cargarDatos]));

  const activos = creditos.filter(c => c.estado === 'activo');
  const deudaTotal = activos.reduce((acc, c) => acc + c.saldoActual, 0);

  const hoy = new Date();
  const mesActual = hoy.getMonth() + 1;
  const anioActual = hoy.getFullYear();

  const pagosEstesMes = activos.reduce((acc, c) => {
    const pagado = c.pagos.some(p => p.mes === mesActual && p.anio === anioActual && p.estado === 'pagado');
    return acc + (pagado ? 0 : (c.cuotaMensual ?? 0));
  }, 0);

  const creditosPendientes = activos.filter(c =>
    !c.pagos.some(p => p.mes === mesActual && p.anio === anioActual && p.estado === 'pagado')
  );

  const vencidos = activos.filter(c =>
    c.pagos.some(p => p.estado === 'vencido')
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={cargarDatos} />}
    >
      {/* Tarjeta resumen principal */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Deuda total activa</Text>
        <Text style={styles.heroMonto}>{formatCurrency(deudaTotal)}</Text>
        <Text style={styles.heroSub}>{activos.length} crédito{activos.length !== 1 ? 's' : ''} activo{activos.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Stats rápidos */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="calendar-outline" size={20} color={colors.warning.default} />
          <Text style={styles.statValor}>{formatCurrency(pagosEstesMes)}</Text>
          <Text style={styles.statLabel}>Por pagar en {MESES[hoy.getMonth()]}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.success.default} />
          <Text style={styles.statValor}>{activos.length - creditosPendientes.length}</Text>
          <Text style={styles.statLabel}>Pagos al corriente</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.destructive.default} />
          <Text style={styles.statValor}>{vencidos.length}</Text>
          <Text style={styles.statLabel}>Con vencidos</Text>
        </View>
      </View>

      {/* Alertas de vencidos */}
      {vencidos.length > 0 && (
        <TouchableOpacity
          style={styles.alerta}
          onPress={() => router.push('/creditos')}
        >
          <Ionicons name="warning" size={18} color={colors.destructive.default} />
          <Text style={styles.alertaTexto}>
            {vencidos.length} crédito{vencidos.length > 1 ? 's' : ''} con pagos vencidos. Toca para ver.
          </Text>
        </TouchableOpacity>
      )}

      {/* Acciones rápidas */}
      <Text style={styles.sectionTitle}>Acciones rápidas</Text>
      <View style={styles.accionesGrid}>
        <TouchableOpacity style={styles.accion} onPress={() => router.push('/creditos/nuevo')}>
          <View style={[styles.accionIcon, { backgroundColor: colors.primary.light }]}>
            <Ionicons name="add" size={22} color={colors.primary.default} />
          </View>
          <Text style={styles.accionLabel}>Nuevo crédito</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.accion} onPress={() => router.push('/pagos')}>
          <View style={[styles.accionIcon, { backgroundColor: colors.success.light }]}>
            <Ionicons name="checkmark" size={22} color={colors.success.default} />
          </View>
          <Text style={styles.accionLabel}>Registrar pago</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.accion} onPress={() => router.push('/priorizacion')}>
          <View style={[styles.accionIcon, { backgroundColor: colors.info.light }]}>
            <Ionicons name="podium-outline" size={22} color={colors.info.default} />
          </View>
          <Text style={styles.accionLabel}>Estrategia</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.accion} onPress={() => router.push('/proyecciones')}>
          <View style={[styles.accionIcon, { backgroundColor: colors.warning.light }]}>
            <Ionicons name="trending-down-outline" size={22} color={colors.warning.default} />
          </View>
          <Text style={styles.accionLabel}>Proyecciones</Text>
        </TouchableOpacity>
      </View>

      {/* Créditos pendientes este mes */}
      {creditosPendientes.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Pendientes este mes</Text>
          {creditosPendientes.slice(0, 5).map(c => (
            <TouchableOpacity
              key={c.id}
              style={styles.pendienteRow}
              onPress={() => router.push(`/creditos/${c.id}`)}
            >
              <Ionicons name="alert-circle" size={18} color={colors.warning.default} />
              <Text style={styles.pendienteNombre} numberOfLines={1}>{c.nombre}</Text>
              <Text style={styles.pendienteMonto}>
                {formatCurrency(c.cuotaMensual ?? c.pagoMinimo ?? 0)}
              </Text>
            </TouchableOpacity>
          ))}
          {creditosPendientes.length > 5 && (
            <TouchableOpacity onPress={() => router.push('/pagos')}>
              <Text style={styles.verMas}>Ver {creditosPendientes.length - 5} más →</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Botón ir a créditos */}
      {creditos.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={56} color={colors.text.disabled} />
          <Text style={styles.emptyTitle}>Sin créditos</Text>
          <Text style={styles.emptyDesc}>Agrega tu primer crédito para comenzar a gestionar tus deudas</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/creditos/nuevo')}>
            <Text style={styles.emptyBtnLabel}>Agregar crédito</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.background },
  content: { padding: spacing.md, gap: spacing.sm },
  heroCard: {
    backgroundColor: colors.primary.default,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadow.md,
  },
  heroLabel: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  heroMonto: { fontSize: 36, fontWeight: '800', color: '#fff' },
  heroSub: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    gap: 4,
    ...shadow.sm,
  },
  statValor: { fontSize: fontSize.md, fontWeight: '700', color: colors.text.primary },
  statLabel: { fontSize: 10, color: colors.text.muted, textAlign: 'center' },
  alerta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.destructive.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.destructive.default,
  },
  alertaTexto: { flex: 1, fontSize: fontSize.sm, color: colors.destructive.text },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  accionesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  accion: {
    width: '47%',
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadow.sm,
  },
  accionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accionLabel: { fontSize: fontSize.sm, fontWeight: '500', color: colors.text.primary },
  pendienteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    ...shadow.sm,
  },
  pendienteNombre: { flex: 1, fontSize: fontSize.sm, color: colors.text.primary },
  pendienteMonto: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text.primary },
  verMas: { fontSize: fontSize.sm, color: colors.primary.default, textAlign: 'center', padding: spacing.sm },
  emptyState: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.xl },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text.primary },
  emptyDesc: { fontSize: fontSize.sm, color: colors.text.muted, textAlign: 'center', maxWidth: 280 },
  emptyBtn: {
    backgroundColor: colors.primary.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  emptyBtnLabel: { color: '#fff', fontWeight: '600', fontSize: fontSize.md },
});
