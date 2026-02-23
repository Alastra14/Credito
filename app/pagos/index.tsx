import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PagoTabla from '@/components/pagos/PagoTabla';
import PagoForm from '@/components/pagos/PagoForm';
import Modal from '@/components/ui/Modal';
import { Credito, Pago, PagoMensualEstado } from '@/types';
import { getCreditos, getPagosByMes, createPago, deletePago, updateCreditoSaldo } from '@/lib/database';
import { cancelNotificationsForPago } from '@/lib/notifications';
import { spacing, fontSize, borderRadius, shadow } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { MESES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { useScrollHideTabBar } from '@/lib/useScrollHideTabBar';

type CreditoConPagosLocal = Credito & { pagos: Pago[] };

export default function PagosScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const now = new Date();
  // Por defecto, mostrar el mes siguiente si ya pasamos el día 15, o el mes actual
  const defaultMes = now.getDate() > 15 ? now.getMonth() + 2 : now.getMonth() + 1;
  const defaultAnio = defaultMes > 12 ? now.getFullYear() + 1 : now.getFullYear();
  const finalMes = defaultMes > 12 ? 1 : defaultMes;

  const [mes, setMes] = useState(finalMes);
  const [anio, setAnio] = useState(defaultAnio);
  const [creditos, setCreditos] = useState<CreditoConPagosLocal[]>([]);
  const [selectedCredito, setSelectedCredito] = useState<CreditoConPagosLocal | null>(null);
  const [selectedMesIndex, setSelectedMesIndex] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { onScroll, onTouchStart, onTouchEnd, scrollEventThrottle } = useScrollHideTabBar();

  const cargar = useCallback(async () => {
    const cs = await getCreditos();
    const activos = cs.filter(c => c.estado === 'activo');
    const pagosDelMes = await getPagosByMes(mes, anio);
    
    const withPagos: CreditoConPagosLocal[] = activos.map(c => ({
      ...c,
      pagos: pagosDelMes.filter(p => p.creditoId === c.id)
    }));
    setCreditos(withPagos);
  }, [mes, anio]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  function changeMonth(dir: number) {
    let m = mes + dir;
    let a = anio;
    if (m > 12) { m = 1; a++; }
    if (m < 1) { m = 12; a--; }
    setMes(m);
    setAnio(a);
  }

  function getPagoEstado(credito: CreditoConPagosLocal): PagoMensualEstado {
    const pago = credito.pagos.find(p => p.mes === mes && p.anio === anio) ?? null;
    let estado: PagoMensualEstado['estado'] = 'pendiente';
    if (pago) {
      estado = pago.estado;
    } else {
      const ahora = new Date();
      if (anio < ahora.getFullYear() || (anio === ahora.getFullYear() && mes < ahora.getMonth() + 1)) {
        estado = 'vencido';
      }
    }
    return { mes, estado, pago };
  }

  function abrirPago(credito: CreditoConPagosLocal, mesIndex: number) {
    setSelectedCredito(credito);
    setSelectedMesIndex(mesIndex);
    setModalVisible(true);
  }

  async function handlePagar(data: Omit<Pago, 'id' | 'creditoId' | 'creadoEn'>, nuevoSaldo?: number) {
    if (!selectedCredito) return;
    await createPago({ ...data, creditoId: selectedCredito.id });
    if (nuevoSaldo !== undefined) {
      await updateCreditoSaldo(selectedCredito.id, nuevoSaldo);
    }
    setModalVisible(false);
    cargar();
  }

  async function handleEliminar(pago: Pago) {
    Alert.alert(
      'Eliminar pago',
      '¿Estás seguro de que deseas eliminar este pago?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await cancelNotificationsForPago(pago.creditoId, pago.mes, pago.anio);
            await deletePago(pago.id);
            cargar();
          },
        },
      ],
    );
  }

  const pendientes = creditos.filter(c => {
    const estado = getPagoEstado(c);
    return estado.estado === 'pendiente' || estado.estado === 'vencido';
  });

  return (
    <View style={styles.container}>
      {/* Selector de mes */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navBtn}>
          <Ionicons name="chevron-back-outline" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.mesLabel}>{MESES[mes - 1]} {anio}</Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navBtn}>
          <Ionicons name="chevron-forward-outline" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Resumen */}
      <View style={styles.resumenRow}>
        <View style={styles.resumenCard}>
          <Text style={styles.resumenNum}>{pendientes.length}</Text>
          <Text style={styles.resumenLbl}>Pendientes</Text>
        </View>
        <View style={styles.resumenCard}>
          <Text style={styles.resumenNum}>{creditos.length - pendientes.length}</Text>
          <Text style={styles.resumenLbl}>Pagados</Text>
        </View>
        <View style={styles.resumenCard}>
          <Text style={styles.resumenNum}>{creditos.length}</Text>
          <Text style={styles.resumenLbl}>Total</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.lista}
        onScroll={onScroll}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        scrollEventThrottle={scrollEventThrottle}
      >
        {creditos.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="wallet-outline" size={48} color={colors.text.disabled} />
            <Text style={styles.emptyTitle}>Sin créditos activos</Text>
            <TouchableOpacity onPress={() => router.push('/creditos/nuevo')} style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>Agregar crédito</Text>
            </TouchableOpacity>
          </View>
        ) : (
          creditos.map(c => {
            const pagoEstado = getPagoEstado(c);
            return (
              <View key={c.id} style={styles.creditoBlock}>
                <TouchableOpacity
                  style={styles.creditoHeader}
                  onPress={() => router.push(`/creditos/${c.id}`)}
                >
                  <Text style={styles.creditoNombre}>{c.nombre}</Text>
                  <Text style={styles.creditoMonto}>{formatCurrency(c.cuotaMensual ?? c.pagoMinimo ?? 0)}</Text>
                </TouchableOpacity>
                <PagoTabla
                  pagosEstado={[pagoEstado]}
                  anio={anio}
                  onPagar={(_mesIndex, _pago) => abrirPago(c, mes - 1)}
                  onEliminar={handleEliminar}
                />
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        noPadding
      >
        {selectedCredito && selectedMesIndex !== null && (
          <PagoForm
            creditoId={selectedCredito.id}
            creditoTipo={selectedCredito.tipo}
            mesIndex={selectedMesIndex}
            anio={anio}
            montoSugerido={selectedCredito.cuotaMensual ?? selectedCredito.pagoMinimo ?? undefined}
            saldoActual={selectedCredito.saldoActual}
            pagoExistente={getPagoEstado(selectedCredito).pago ?? undefined}
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
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface.card,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 2, borderBottomColor: colors.surface.border,
  },
  navBtn: { padding: spacing.sm },
  mesLabel: { fontSize: fontSize.xl, fontWeight: '900', color: colors.text.primary, textTransform: 'uppercase', letterSpacing: -0.5, fontFamily: 'SpaceGrotesk_700Bold',},
  resumenRow: {
    flexDirection: 'row', gap: spacing.md,
    padding: spacing.lg, backgroundColor: colors.surface.card,
    borderBottomWidth: 2, borderBottomColor: colors.surface.border,
  },
  resumenCard: {
    flex: 1, alignItems: 'center', padding: spacing.md,
    backgroundColor: colors.surface.background,
    borderRadius: borderRadius.xl,
    ...shadow.sm,
  },
  resumenNum: { fontSize: fontSize.xxl, fontWeight: '900', color: colors.text.primary, letterSpacing: -1, fontFamily: 'SpaceGrotesk_700Bold',},
  resumenLbl: { fontSize: 10, color: colors.text.secondary, fontWeight: '900', textTransform: 'uppercase' },
  lista: { padding: spacing.lg, gap: spacing.md },
  creditoBlock: {
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.xl,
    ...shadow.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  creditoHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.lg, borderBottomWidth: 2, borderBottomColor: colors.text.primary,
    backgroundColor: colors.primary.default,
  },
  creditoNombre: { fontSize: fontSize.lg, fontWeight: '900', color: colors.text.primary, textTransform: 'uppercase', letterSpacing: -0.5 },
  creditoMonto: { fontSize: fontSize.md, color: colors.text.primary, fontWeight: '900', fontFamily: 'SpaceGrotesk_700Bold',},
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  emptyTitle: { fontSize: fontSize.lg, color: colors.text.secondary, fontWeight: '900', textTransform: 'uppercase' },
  emptyBtn: {
    backgroundColor: colors.text.primary, paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  emptyBtnText: { color: colors.surface.background, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
});
}
