import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Badge from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { CreditoConPagos } from '@/types';
import { getCreditoById, deleteCredito } from '@/lib/database';
import { cancelNotificationsForCredito } from '@/lib/notifications';
import { colors, spacing, borderRadius, fontSize, shadow } from '@/lib/theme';
import { formatCurrency, tipoLabel, tipoIcon } from '@/lib/utils';

export default function CreditoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [credito, setCredito] = useState<CreditoConPagos | null>(null);

  const cargar = useCallback(async () => {
    if (!id) return;
    const c = await getCreditoById(id);
    setCredito(c);
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  if (!credito) return null;

  const pagadosCount = credito.pagos.filter(p => p.estado === 'pagado').length;

  function confirmDelete() {
    Alert.alert(
      'Eliminar crédito',
      `¿Seguro que deseas eliminar "${credito!.nombre}"? Se eliminarán todos sus pagos y documentos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await cancelNotificationsForCredito(credito!.id);
            await deleteCredito(credito!.id);
            router.replace('/creditos');
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Encabezado */}
      <View style={styles.heroRow}>
        <View style={[styles.iconBox, { backgroundColor: colors.primary.light }]}>
          <Ionicons name={tipoIcon(credito.tipo) as any} size={28} color={colors.primary.default} />
        </View>
        <View style={styles.heroInfo}>
          <Text style={styles.nombre}>{credito.nombre}</Text>
          <Text style={styles.tipo}>{tipoLabel(credito.tipo)}</Text>
          {credito.institucion && <Text style={styles.institucion}>{credito.institucion}</Text>}
        </View>
        <Badge
          variant={
            credito.estado === 'activo' ? 'default' :
            credito.estado === 'pagado' ? 'success' : 'secondary'
          }
        >
          {credito.estado === 'activo' ? 'Activo' :
           credito.estado === 'pagado' ? 'Pagado' : 'Cancelado'}
        </Badge>
      </View>

      {/* Datos financieros */}
      <Card style={styles.card}>
        <CardHeader title="Información financiera" />
        <CardContent>
          <View style={styles.grid}>
            <DataItem label="Saldo actual" value={formatCurrency(credito.saldoActual)} />
            <DataItem label="Tasa anual" value={`${credito.tasaAnual.toFixed(2)}%`} />
            {credito.cuotaMensual != null && (
              <DataItem label="Cuota mensual" value={formatCurrency(credito.cuotaMensual)} />
            )}
            {credito.pagoMinimo != null && (
              <DataItem label="Pago mínimo" value={formatCurrency(credito.pagoMinimo)} />
            )}
            {credito.plazoMeses != null && (
              <DataItem label="Plazo" value={`${credito.plazoMeses} meses`} />
            )}
            {credito.fechaLimitePago != null && (
              <DataItem label="Día límite" value={`Día ${credito.fechaLimitePago}`} />
            )}
            {credito.fechaCorte != null && (
              <DataItem label="Día de corte" value={`Día ${credito.fechaCorte}`} />
            )}
          </View>
          {credito.notas && (
            <Text style={styles.notas}>{credito.notas}</Text>
          )}
        </CardContent>
      </Card>

      {/* Progreso */}
      {credito.plazoMeses != null && credito.plazoMeses > 0 && (
        <Card style={styles.card}>
          <CardHeader title="Progreso de pagos" />
          <CardContent>
            <View style={styles.progresoRow}>
              <View style={styles.progresoBar}>
                <View style={[
                  styles.progresoFill,
                  { width: `${Math.min(100, (pagadosCount / credito.plazoMeses) * 100)}%` }
                ]} />
              </View>
              <Text style={styles.progresoLabel}>{pagadosCount}/{credito.plazoMeses}</Text>
            </View>
          </CardContent>
        </Card>
      )}

      {/* Acciones */}
      <View style={styles.acciones}>
        <TouchableOpacity style={styles.accionBtn} onPress={() => router.push(`/creditos/${id}/pagos`)}>
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary.default} />
          <Text style={styles.accionLabel}>Pagos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.accionBtn} onPress={() => router.push(`/creditos/${id}/documentos`)}>
          <Ionicons name="document-outline" size={20} color={colors.info.default} />
          <Text style={styles.accionLabel}>Docs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.accionBtn} onPress={() => router.push(`/creditos/${id}/editar`)}>
          <Ionicons name="pencil-outline" size={20} color={colors.warning.default} />
          <Text style={styles.accionLabel}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.accionBtn} onPress={confirmDelete}>
          <Ionicons name="trash-outline" size={20} color={colors.destructive.default} />
          <Text style={[styles.accionLabel, { color: colors.destructive.default }]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={dataStyles.item}>
      <Text style={dataStyles.label}>{label}</Text>
      <Text style={dataStyles.value}>{value}</Text>
    </View>
  );
}

const dataStyles = StyleSheet.create({
  item: { width: '48%', marginBottom: spacing.sm },
  label: { fontSize: fontSize.xs, color: colors.text.muted },
  value: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text.primary },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.background },
  content: { padding: spacing.md, gap: spacing.sm },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  iconBox: {
    width: 52, height: 52, borderRadius: borderRadius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  heroInfo: { flex: 1 },
  nombre: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text.primary },
  tipo: { fontSize: fontSize.sm, color: colors.text.secondary },
  institucion: { fontSize: fontSize.xs, color: colors.text.muted },
  card: { marginBottom: 0 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  notas: { fontSize: fontSize.sm, color: colors.text.muted, marginTop: spacing.sm, fontStyle: 'italic' },
  progresoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  progresoBar: {
    flex: 1, height: 8, backgroundColor: colors.surface.border,
    borderRadius: borderRadius.full, overflow: 'hidden',
  },
  progresoFill: {
    height: '100%', backgroundColor: colors.primary.default, borderRadius: borderRadius.full,
  },
  progresoLabel: { fontSize: fontSize.sm, color: colors.text.muted },
  acciones: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadow.sm,
  },
  accionBtn: { alignItems: 'center', gap: 4 },
  accionLabel: { fontSize: fontSize.xs, color: colors.text.secondary },
});
