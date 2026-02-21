import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PagoTabla from '@/components/pagos/PagoTabla';
import PagoForm from '@/components/pagos/PagoForm';
import Modal from '@/components/ui/Modal';
import { Credito, Pago, PagoMensualEstado } from '@/types';
import { getCreditos, getPagosByCredito, createPago, deletePago } from '@/lib/database';
import { cancelNotificationsForPago } from '@/lib/notifications';
import { colors, spacing, fontSize, borderRadius, shadow } from '@/lib/theme';
import { MESES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

type CreditoConPagosLocal = Credito & { pagos: Pago[] };

export default function PagosScreen() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [anio, setAnio] = useState(now.getFullYear());
  const [creditos, setCreditos] = useState<CreditoConPagosLocal[]>([]);
  const [selectedCredito, setSelectedCredito] = useState<CreditoConPagosLocal | null>(null);
  const [selectedMesIndex, setSelectedMesIndex] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const cargar = useCallback(async () => {
    const cs = await getCreditos();
    const activos = cs.filter(c => c.estado === 'activo');
    const withPagos: CreditoConPagosLocal[] = await Promise.all(
      activos.map(async c => ({ ...c, pagos: await getPagosByCredito(c.id) }))
    );
    setCreditos(withPagos);
  }, []);

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

  async function handlePagar(data: Omit<Pago, 'id' | 'creditoId' | 'creadoEn'>) {
    if (!selectedCredito) return;
    await createPago({ ...data, creditoId: selectedCredito.id });
    setModalVisible(false);
    cargar();
  }

  async function handleEliminar(pago: Pago) {
    await cancelNotificationsForPago(pago.creditoId, pago.mes, pago.anio);
    await deletePago(pago.id);
    cargar();
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
          <Ionicons name="chevron-back-outline" size={22} color={colors.primary.default} />
        </TouchableOpacity>
        <Text style={styles.mesLabel}>{MESES[mes - 1]} {anio}</Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navBtn}>
          <Ionicons name="chevron-forward-outline" size={22} color={colors.primary.default} />
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

      <ScrollView contentContainerStyle={styles.lista}>
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
                  onPagar={(_mesIndex, _pago) => abrirPago(c, mes)}
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
        title={`Registrar pago — ${MESES[mes - 1]} ${anio}`}
      >
        {selectedCredito && selectedMesIndex !== null && (
          <PagoForm
            creditoId={selectedCredito.id}
            mesIndex={selectedMesIndex}
            anio={anio}
            montoSugerido={selectedCredito.cuotaMensual ?? selectedCredito.pagoMinimo ?? undefined}
            pagoExistente={getPagoEstado(selectedCredito).pago ?? undefined}
            onSubmit={handlePagar}
            onCancel={() => setModalVisible(false)}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface.card,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.surface.border,
  },
  navBtn: { padding: spacing.sm },
  mesLabel: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text.primary },
  resumenRow: {
    flexDirection: 'row', gap: spacing.sm,
    padding: spacing.md, backgroundColor: colors.surface.card,
    borderBottomWidth: 1, borderBottomColor: colors.surface.border,
  },
  resumenCard: {
    flex: 1, alignItems: 'center', padding: spacing.sm,
    backgroundColor: colors.surface.background,
    borderRadius: borderRadius.md,
  },
  resumenNum: { fontSize: fontSize.xl, fontWeight: '700', color: colors.primary.default },
  resumenLbl: { fontSize: fontSize.xs, color: colors.text.muted },
  lista: { padding: spacing.md, gap: spacing.sm },
  creditoBlock: {
    backgroundColor: colors.surface.card, borderRadius: borderRadius.md,
    overflow: 'hidden', ...shadow.sm,
  },
  creditoHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.surface.border,
  },
  creditoNombre: { fontSize: fontSize.md, fontWeight: '600', color: colors.text.primary },
  creditoMonto: { fontSize: fontSize.sm, color: colors.primary.default, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyTitle: { fontSize: fontSize.lg, color: colors.text.muted },
  emptyBtn: {
    backgroundColor: colors.primary.default, paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm, borderRadius: borderRadius.md,
  },
  emptyBtnText: { color: colors.primary.text, fontWeight: '600' },
});
