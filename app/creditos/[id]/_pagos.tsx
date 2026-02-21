import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import PagoTabla from '@/components/pagos/PagoTabla';
import PagoForm from '@/components/pagos/PagoForm';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Credito, PagoMensualEstado, Pago } from '@/types';
import { getCreditoById, getPagosByCredito, createPago, deletePago, updateCreditoSaldo } from '@/lib/database';
import { cancelNotificationsForPago } from '@/lib/notifications';
import { spacing, fontSize, borderRadius } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { MESES } from '@/lib/constants';
import { useToast } from '@/components/ui/Toast';

export default function PagosCreditoScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const now = new Date();
  const [anio, setAnio] = useState(now.getFullYear());
  const [credito, setCredito] = useState<Credito | null>(null);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMes, setSelectedMes] = useState<number | null>(null);
  const [pagoToDelete, setPagoToDelete] = useState<Pago | null>(null);
  const { showToast } = useToast();

  const cargar = useCallback(async () => {
    if (!id) return;
    const c = await getCreditoById(id);
    if (c) {
      setCredito(c);
      const ps = await getPagosByCredito(id);
      setPagos(ps);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const pagosMes: PagoMensualEstado[] = MESES.map((_, i) => {
    const mes = i + 1;
    const pagoExistente = pagos.find(p => p.mes === mes && p.anio === anio) ?? null;
    let estado: PagoMensualEstado['estado'] = 'pendiente';
    if (pagoExistente) {
      estado = pagoExistente.estado;
    } else {
      const limiteAno = anio;
      const limiteMes = mes;
      const ahora = new Date();
      if (
        limiteAno < ahora.getFullYear() ||
        (limiteAno === ahora.getFullYear() && limiteMes < ahora.getMonth() + 1)
      ) {
        estado = 'vencido';
      }
    }
    return { mes, estado, pago: pagoExistente };
  }).filter(item => {
    // Si el crédito está pagado (saldo 0) o es TDC y no hay pago mínimo, no mostrar pendientes/vencidos
    if (item.estado === 'pendiente' || item.estado === 'vencido') {
      if (credito?.saldoActual === 0) return false;
      if (credito?.tipo === 'tarjeta_credito' && credito.pagoMinimo === 0) return false;
    }
    return true;
  });

  function abrirModal(mesIndex: number, _pagoExistente: Pago | null) {
    setSelectedMes(mesIndex);
    setModalVisible(true);
  }

  async function handlePagar(data: Omit<Pago, 'id' | 'creditoId' | 'creadoEn'>, nuevoSaldo?: number) {
    if (!id) return;
    await createPago({ ...data, creditoId: id });
    if (nuevoSaldo !== undefined) {
      await updateCreditoSaldo(id, nuevoSaldo);
    }
    setModalVisible(false);
    showToast({
      title: 'Pago registrado',
      message: `El pago de ${MESES[data.mes - 1]} se ha guardado correctamente.`,
      type: 'success',
    });
    cargar();
  }

  async function handleEliminar(pago: Pago) {
    setPagoToDelete(pago);
  }

  async function confirmEliminar() {
    if (!pagoToDelete) return;
    await cancelNotificationsForPago(pagoToDelete.creditoId, pagoToDelete.mes, pagoToDelete.anio);
    await deletePago(pagoToDelete.id);
    showToast({
      title: 'Pago eliminado',
      message: `El pago de ${MESES[pagoToDelete.mes - 1]} ha sido eliminado.`,
      type: 'info',
    });
    setPagoToDelete(null);
    cargar();
  }

  return (
    <View style={styles.container}>
      {/* Selector de año */}
      <View style={styles.yearRow}>
        <TouchableOpacity onPress={() => setAnio(a => a - 1)} style={styles.yearBtn}>
          <Text style={styles.yearArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.yearText}>{anio}</Text>
        <TouchableOpacity onPress={() => setAnio(a => a + 1)} style={styles.yearBtn}>
          <Text style={styles.yearArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <PagoTabla
        pagosEstado={pagosMes}
        anio={anio}
        onPagar={abrirModal}
        onEliminar={handleEliminar}
      />

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        noPadding
      >
        {selectedMes !== null && id && credito && (
          <PagoForm
            creditoId={id}
            creditoTipo={credito.tipo}
            mesIndex={selectedMes}
            anio={anio}
            montoSugerido={credito.cuotaMensual ?? credito.pagoMinimo ?? undefined}
            saldoActual={credito.saldoActual}
            pagoExistente={pagosMes[selectedMes - 1]?.pago ?? undefined}
            onSubmit={handlePagar}
            onCancel={() => setModalVisible(false)}
          />
        )}
      </Modal>

      <Modal
        visible={!!pagoToDelete}
        onClose={() => setPagoToDelete(null)}
        title="Eliminar pago"
      >
        <Text style={styles.modalText}>
          ¿Seguro que deseas eliminar este pago?
        </Text>
        <View style={styles.modalActions}>
          <Button 
            variant="outline" 
            onPress={() => setPagoToDelete(null)}
            style={styles.modalBtn}
          >
            Cancelar
          </Button>
          <Button 
            onPress={confirmEliminar}
            style={[styles.modalBtn, { backgroundColor: colors.destructive.default }]}
          >
            Eliminar
          </Button>
        </View>
      </Modal>
    </View>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.background },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface.card,
    borderBottomWidth: 2,
    borderBottomColor: colors.text.primary,
  },
  yearBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  yearArrow: { fontSize: 24, color: colors.text.primary, fontWeight: '900', fontFamily: 'SpaceGrotesk_700Bold',},
  yearText: { fontSize: fontSize.lg, fontWeight: '900', color: colors.text.primary, minWidth: 60, textAlign: 'center', fontFamily: 'SpaceGrotesk_700Bold',},
  modalText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalBtn: {
    flex: 1,
  },
});
}
