import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import CreditoForm from '@/components/creditos/CreditoForm';
import { CreditoFormData } from '@/types';
import { createCredito } from '@/lib/database';
import { schedulePaymentReminders } from '@/lib/notifications';
import { spacing } from '@/lib/theme';
import { calcularCuotaMensual } from '@/lib/calculos/amortizacion';
import { useToast } from '@/components/ui/Toast';
import { useScrollHideTabBar } from '@/lib/useScrollHideTabBar';

export default function NuevoCreditoScreen() {
  const { showToast } = useToast();
  const { onScroll } = useScrollHideTabBar();

  async function handleSubmit(data: CreditoFormData) {
    // Calcular cuota si no se ingresó
    const cuota = data.cuotaMensual
      ?? calcularCuotaMensual(data.saldoActual, data.tasaAnual, data.plazoMeses ?? 60);

    const credito = await createCredito({ ...data, cuotaMensual: cuota });

    // Programar notificaciones si tiene fecha límite de pago o fecha de corte
    if ((credito.fechaLimitePago || credito.fechaCorte) && credito.estado === 'activo') {
      const hoy = new Date();
      await schedulePaymentReminders(
        credito.id,
        credito.nombre,
        cuota,
        credito.fechaLimitePago,
        credito.fechaCorte,
        hoy.getMonth() + 1,
        hoy.getFullYear(),
      );
    }

    showToast({
      title: '¡Crédito creado!',
      message: `"${credito.nombre}" fue agregado exitosamente.`,
      type: 'success',
    });
    router.replace('/creditos');
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      <CreditoForm onSubmit={handleSubmit} onCancel={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md },
});
