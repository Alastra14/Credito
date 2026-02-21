import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CreditoConPagos } from '@/types';
import { getCreditos, getCreditoById, createPago, updateCreditoSaldo } from '@/lib/database';
import { spacing, borderRadius, fontSize, shadow, typography } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { formatCurrency } from '@/lib/utils';
import { MESES } from '@/lib/constants';
import { useScrollHideTabBar } from '@/lib/useScrollHideTabBar';
import FloatingDollars from '@/components/ui/FloatingDollars';
import PagoForm from '@/components/pagos/PagoForm';
import Modal from '@/components/ui/Modal';
import { Pago } from '@/types';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [creditos, setCreditos] = useState<CreditoConPagos[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCredito, setSelectedCredito] = useState<CreditoConPagos | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { onScroll, onTouchStart, onTouchEnd, scrollEventThrottle } = useScrollHideTabBar();

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

  const onRefresh = useCallback(async () => {
    await cargarDatos();
    // Forzar que el menú se muestre al refrescar
    onScroll({
      nativeEvent: { contentOffset: { y: 0 } },
      timeStamp: Date.now()
    } as any);
  }, [cargarDatos, onScroll]);

  const activos = creditos.filter(c => c.estado === 'activo');
  const deudaTotal = activos.reduce((acc, c) => acc + c.saldoActual, 0);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
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

  const ultimosPagos = creditos
    .flatMap(c => c.pagos.map(p => ({ ...p, creditoNombre: c.nombre })))
    .filter(p => p.estado === 'pagado')
    .sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime())
    .slice(0, 5);

  const proximosEventos: { id: string; tipo: 'pago' | 'corte' | 'ventana'; fecha: Date; titulo: string; desc: string; color: string }[] = [];
  
  activos.forEach(c => {
    if (c.fechaCorte) {
      let nextCorte = new Date(anioActual, mesActual - 1, c.fechaCorte);
      if (nextCorte < hoy) {
        nextCorte = new Date(anioActual, mesActual, c.fechaCorte);
      }
      proximosEventos.push({
        id: `corte-${c.id}-${nextCorte.getTime()}`,
        tipo: 'corte',
        fecha: nextCorte,
        titulo: 'Fecha de Corte',
        desc: `Cierre de facturación de ${c.nombre}`,
        color: colors.warning.default,
      });

      const ventana = new Date(nextCorte);
      ventana.setDate(ventana.getDate() + 1);
      proximosEventos.push({
        id: `ventana-${c.id}-${ventana.getTime()}`,
        tipo: 'ventana',
        fecha: ventana,
        titulo: 'Mejor momento para comprar',
        desc: `Con ${c.nombre} tendrás más tiempo para pagar`,
        color: colors.success.default,
      });
    }

    if (c.fechaLimitePago) {
      let nextPago = new Date(anioActual, mesActual - 1, c.fechaLimitePago);
      
      if (c.fechaCorte) {
        if (c.fechaLimitePago < c.fechaCorte) {
          let corteEsteMes = new Date(anioActual, mesActual - 1, c.fechaCorte);
          if (hoy > corteEsteMes) {
            nextPago = new Date(anioActual, mesActual, c.fechaLimitePago);
          }
        }
      }

      if (nextPago < hoy) {
        nextPago.setMonth(nextPago.getMonth() + 1);
      }
      proximosEventos.push({
        id: `pago-${c.id}-${nextPago.getTime()}`,
        tipo: 'pago',
        fecha: nextPago,
        titulo: 'Fecha Límite de Pago',
        desc: `Último día para pagar ${c.nombre}`,
        color: colors.destructive.default,
      });
    }
  });

  proximosEventos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  const eventosMostrar = proximosEventos.slice(0, 5);

  const limiteTotal = activos.reduce((acc, c) => acc + (c.limiteCredito || 0), 0);
  const deudaTarjetas = activos.filter(c => c.tipo === 'tarjeta_credito').reduce((acc, c) => acc + c.saldoActual, 0);
  const creditoDisponible = Math.max(0, limiteTotal - deudaTarjetas);

  async function handlePagar(data: Omit<Pago, 'id' | 'creditoId' | 'creadoEn'>, nuevoSaldo?: number) {
    if (!selectedCredito) return;
    await createPago({ ...data, creditoId: selectedCredito.id });
    if (nuevoSaldo !== undefined) {
      await updateCreditoSaldo(selectedCredito.id, nuevoSaldo);
    }
    setModalVisible(false);
    cargarDatos();
  }

  return (
    <View style={styles.container}>
      {/* Tarjeta resumen principal (Fija) */}
      <View style={styles.heroWrapper}>
        <View style={styles.heroCardFixed}>
          <FloatingDollars />
          <Text style={styles.heroLabel}>Deuda total activa</Text>
          <Text style={styles.heroMonto}>{formatCurrency(deudaTotal)}</Text>
          <Text style={styles.heroSub}>{activos.length} crédito{activos.length !== 1 ? 's' : ''} activo{activos.length !== 1 ? 's' : ''}</Text>
          
          {limiteTotal > 0 && (
            <View style={styles.heroDisponibleContainer}>
              <Text style={styles.heroDisponibleLabel}>Crédito Disponible:</Text>
              <Text style={styles.heroDisponibleMonto}>{formatCurrency(creditoDisponible)}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
        onScroll={onScroll}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* Stats rápidos */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statIconWrapper, { backgroundColor: colors.surface.muted }]}>
            <Ionicons name="calendar-outline" size={20} color={colors.text.primary} />
          </View>
          <Text style={styles.statValor}>{formatCurrency(pagosEstesMes)}</Text>
          <Text style={styles.statLabel}>Por pagar en {MESES[hoy.getMonth()]}</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconWrapper, { backgroundColor: colors.surface.muted }]}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.text.primary} />
          </View>
          <Text style={styles.statValor}>{activos.length - creditosPendientes.length}</Text>
          <Text style={styles.statLabel}>Pagos al corriente</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIconWrapper, { backgroundColor: colors.surface.muted }]}>
            <Ionicons name="alert-circle-outline" size={20} color={colors.text.primary} />
          </View>
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

      {/* Timeline */}
      <Text style={styles.sectionTitle}>Próximos Eventos</Text>
      <View style={styles.timelineContainer}>
        {eventosMostrar.length > 0 ? (
          eventosMostrar.map((evento, index) => (
            <View key={evento.id} style={styles.timelineItem}>
              <View style={styles.timelineLine}>
                <View style={[styles.timelineDot, { backgroundColor: evento.color }]} />
                {index !== eventosMostrar.length - 1 && <View style={styles.timelineConnector} />}
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>{evento.titulo}</Text>
                <Text style={styles.timelineDesc}>{evento.desc}</Text>
                <Text style={styles.timelineDate}>
                  {evento.fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyTimeline}>No hay eventos próximos</Text>
        )}
      </View>

      {/* Créditos pendientes este mes */}
      {creditosPendientes.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Pendientes este mes</Text>
          {creditosPendientes.slice(0, 5).map(c => (
            <TouchableOpacity
              key={c.id}
              style={styles.pendienteRow}
              onPress={() => {
                setSelectedCredito(c);
                setModalVisible(true);
              }}
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

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        noPadding
      >
        {selectedCredito && (
          <PagoForm
            creditoId={selectedCredito.id}
            creditoTipo={selectedCredito.tipo}
            mesIndex={mesActual}
            anio={anioActual}
            montoSugerido={selectedCredito.cuotaMensual ?? selectedCredito.pagoMinimo ?? undefined}
            saldoActual={selectedCredito.saldoActual}
            onSubmit={handlePagar}
            onCancel={() => setModalVisible(false)}
          />
        )}
      </Modal>
    </View>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.background },
  scrollContainer: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingTop: spacing.md },
  heroWrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    zIndex: 10,
  },
  heroCardFixed: {
    backgroundColor: colors.surface.inverse,
    padding: spacing.xl,
    alignItems: 'flex-start',
    borderRadius: borderRadius.xl,
    ...shadow.lg,
  },
  heroLabel: { fontSize: fontSize.sm, color: colors.text.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '900' },
  heroMonto: { fontSize: 42, fontWeight: '900', color: colors.text.inverse, letterSpacing: -1 },
  heroSub: { fontSize: fontSize.sm, color: colors.primary.default, marginTop: 8, fontWeight: '900', textTransform: 'uppercase' },
  heroDisponibleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  heroDisponibleLabel: { fontSize: fontSize.sm, color: colors.text.muted, fontWeight: '900', textTransform: 'uppercase' },
  heroDisponibleMonto: { fontSize: fontSize.lg, color: colors.success.default, fontWeight: '900' },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface.card,
    padding: spacing.md,
    alignItems: 'center',
    gap: 8,
    borderRadius: borderRadius.xl,
    ...shadow.md,
  },
  statIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValor: { fontSize: fontSize.lg, fontWeight: '900', color: colors.text.primary, letterSpacing: -0.5, fontFamily: 'SpaceGrotesk_700Bold',},
  statLabel: { fontSize: 10, color: colors.text.secondary, textAlign: 'center', fontWeight: '900', textTransform: 'uppercase' },
  alerta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.destructive.default,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadow.md,
  },
  alertaTexto: { flex: 1, fontSize: fontSize.sm, fontWeight: '900', color: colors.text.inverse, textTransform: 'uppercase' },
  sectionTitle: {
    ...typography.titleUrban,
    fontSize: fontSize.xl,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  timelineContainer: {
    backgroundColor: colors.surface.card,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadow.md,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineLine: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary.default,
    zIndex: 1,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: colors.text.primary,
    marginTop: -2,
    marginBottom: -2,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: spacing.md,
    paddingBottom: spacing.lg,
  },
  timelineTitle: {
    fontSize: fontSize.md,
    fontWeight: '900',
    color: colors.text.primary,
    textTransform: 'uppercase',
  },
  timelineDesc: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
    fontWeight: '600',
  },
  timelineDate: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 4,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  emptyTimeline: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    textAlign: 'center',
    fontWeight: '900',
    textTransform: 'uppercase',
    paddingVertical: spacing.md,
  },
  pendienteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface.card,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadow.md,
  },
  pendienteNombre: { flex: 1, fontSize: fontSize.md, fontWeight: '900', color: colors.text.primary, textTransform: 'uppercase' },
  pendienteMonto: { fontSize: fontSize.lg, fontWeight: '900', color: colors.text.primary, letterSpacing: -0.5 },
  verMas: { fontSize: fontSize.sm, fontWeight: '900', color: colors.primary.default, textAlign: 'center', padding: spacing.md, textTransform: 'uppercase' },
  emptyState: { alignItems: 'center', gap: spacing.md, paddingTop: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyTitle: { fontSize: fontSize.xxl, fontWeight: '900', color: colors.text.primary, letterSpacing: -1, textTransform: 'uppercase' },
  emptyDesc: { fontSize: fontSize.md, color: colors.text.secondary, textAlign: 'center', fontWeight: '600', lineHeight: 24 },
  emptyBtn: {
    backgroundColor: colors.text.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  emptyBtnLabel: { color: colors.surface.background, fontWeight: '900', fontSize: fontSize.md, textTransform: 'uppercase', letterSpacing: 1 },
});
}
