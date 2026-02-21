import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import CreditoForm from '@/components/creditos/CreditoForm';
import { CreditoConPagos, CreditoFormData } from '@/types';
import { getCreditoById, updateCredito } from '@/lib/database';
import { cancelNotificationsForCredito, schedulePaymentReminders } from '@/lib/notifications';
import { spacing, fontSize } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { useScrollHideTabBar } from '@/lib/useScrollHideTabBar';

export default function EditarCreditoScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [credito, setCredito] = useState<CreditoConPagos | null>(null);
  const { onScroll } = useScrollHideTabBar();

  useEffect(() => {
    if (id) getCreditoById(id).then(setCredito);
  }, [id]);

  const handleSubmit = useCallback(async (data: CreditoFormData) => {
    if (!id) return;
    await cancelNotificationsForCredito(id);
    await updateCredito(id, data);
    if ((data.fechaLimitePago || data.fechaCorte) && data.cuotaMensual !== undefined) {
      await schedulePaymentReminders(
        id,
        data.nombre,
        data.cuotaMensual,
        data.fechaLimitePago ?? null,
        data.fechaCorte ?? null,
        new Date().getMonth() + 1,
        new Date().getFullYear(),
      );
    }
    router.back();
  }, [id]);

  if (!credito) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Cargando...</Text>
      </View>
    );
  }

  const initialData: CreditoFormData = {
    nombre: credito.nombre,
    tipo: credito.tipo,
    saldoActual: credito.saldoActual,
    saldoOriginal: credito.saldoOriginal,
    tasaAnual: credito.tasaAnual,
    estado: credito.estado,
    plazoMeses: credito.plazoMeses ?? undefined,
    cuotaMensual: credito.cuotaMensual ?? undefined,
    pagoMinimo: credito.pagoMinimo ?? undefined,
    fechaCorte: credito.fechaCorte ?? undefined,
    fechaLimitePago: credito.fechaLimitePago ?? undefined,
    institucion: credito.institucion ?? undefined,
    notas: credito.notas ?? undefined,
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      <CreditoForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </ScrollView>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.background },
  content: { padding: spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loading: { fontSize: fontSize.md, color: colors.text.secondary, fontWeight: '900', textTransform: 'uppercase' },
});
}
