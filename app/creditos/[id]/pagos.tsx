import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import PagoTabla from '@/components/pagos/PagoTabla';
import PagoForm from '@/components/pagos/PagoForm';
import Modal from '@/components/ui/Modal';
import { Credito, PagoMensualEstado, Pago } from '@/types';
import { getCreditoById, getPagosByCredito, createPago, deletePago } from '@/lib/database';
import { cancelNotificationsForPago } from '@/lib/notifications';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import { MESES } from '@/lib/constants';

export default function PagosCreditoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const now = new Date();
  const [anio, setAnio] = useState(now.getFullYear());
  const [credito, setCredito] = useState<Credito | null>(null);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMes, setSelectedMes] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    if (!id) return;
    const c = await getCreditoById(id);
    if (c) {
      setCredito(c);
      const ps = await getPagosByCredito(id);
      setPagos(ps);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

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
  });

  function abrirModal(mesIndex: number, _pagoExistente: Pago | null) {
    setSelectedMes(mesIndex);
    setModalVisible(true);
  }

  async function handlePagar(data: Omit<Pago, 'id' | 'creditoId' | 'creadoEn'>) {
    if (!id) return;
    await createPago({ ...data, creditoId: id });
    setModalVisible(false);
    cargar();
  }

  async function handleEliminar(pago: Pago) {
    Alert.alert('Eliminar pago', '¿Seguro que deseas eliminar este pago?', [
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
    ]);
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
        title={selectedMes !== null ? `Registrar pago — ${MESES[selectedMes - 1]} ${anio}` : 'Registrar pago'}
      >
        {selectedMes !== null && id && credito && (
          <PagoForm
            creditoId={id}
            mesIndex={selectedMes}
            anio={anio}
            montoSugerido={credito.cuotaMensual ?? credito.pagoMinimo ?? undefined}
            pagoExistente={pagosMes[selectedMes - 1]?.pago ?? undefined}
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
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  yearBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  yearArrow: { fontSize: 24, color: colors.primary.default },
  yearText: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text.primary, minWidth: 60, textAlign: 'center' },
});
