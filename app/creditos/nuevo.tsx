import React from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import CreditoForm from '@/components/creditos/CreditoForm';
import { CreditoFormData } from '@/types';
import { createCredito } from '@/lib/database';
import { schedulePaymentReminders } from '@/lib/notifications';
import { spacing } from '@/lib/theme';
import { calcularCuotaMensual } from '@/lib/calculos/amortizacion';

export default function NuevoCreditoScreen() {
  async function handleSubmit(data: CreditoFormData) {
    // Calcular cuota si no se ingresó
    const cuota = data.cuotaMensual
      ?? calcularCuotaMensual(data.saldoActual, data.tasaAnual, data.plazoMeses ?? 60);

    const credito = await createCredito({ ...data, cuotaMensual: cuota });

    // Programar notificaciones si tiene fecha límite de pago
    if (credito.fechaLimitePago && credito.estado === 'activo') {
      const hoy = new Date();
      await schedulePaymentReminders(
        credito.id,
        credito.nombre,
        cuota,
        credito.fechaLimitePago,
        hoy.getMonth() + 1,
        hoy.getFullYear(),
      );
    }

    Alert.alert('¡Crédito creado!', `"${credito.nombre}" fue agregado exitosamente.`);
    router.replace('/creditos');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <CreditoForm onSubmit={handleSubmit} onCancel={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md },
});
