import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CreditoConPagos } from '@/types';
import { colors, spacing, borderRadius, fontSize, shadow } from '@/lib/theme';
import { formatCurrency, tipoIcon, tipoLabel, estadoPagoColor } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

interface CreditoCardProps {
  credito: CreditoConPagos;
  onPress?: () => void;
}

export default function CreditoCard({ credito, onPress }: CreditoCardProps) {
  const pagados = credito.pagos.filter(p => p.estado === 'pagado').length;
  const totalPagos = credito.plazoMeses ?? 0;
  const progreso = totalPagos > 0 ? pagados / totalPagos : 0;

  const vencidos = credito.pagos.filter(p => p.estado === 'vencido').length;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary.light }]}>
          <Ionicons
            name={tipoIcon(credito.tipo) as any}
            size={22}
            color={colors.primary.default}
          />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.nombre} numberOfLines={1}>
            {credito.nombre}
          </Text>
          <Text style={styles.tipo}>{tipoLabel(credito.tipo)}</Text>
        </View>
        <View style={styles.headerRight}>
          <Badge estado={credito.estado as any} />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.body}>
        <View style={styles.campo}>
          <Text style={styles.label}>Saldo</Text>
          <Text style={styles.valor}>{formatCurrency(credito.saldoActual)}</Text>
        </View>
        <View style={styles.campo}>
          <Text style={styles.label}>Tasa</Text>
          <Text style={styles.valor}>{credito.tasaAnual.toFixed(2)}%</Text>
        </View>
        {credito.cuotaMensual != null && (
          <View style={styles.campo}>
            <Text style={styles.label}>Cuota</Text>
            <Text style={styles.valor}>{formatCurrency(credito.cuotaMensual)}</Text>
          </View>
        )}
      </View>

      {totalPagos > 0 && (
        <View style={styles.progresoContainer}>
          <View style={styles.progresoBar}>
            <View style={[styles.progresoFill, { width: `${progreso * 100}%` }]} />
          </View>
          <Text style={styles.progresoLabel}>
            {pagados}/{totalPagos} pagos
          </Text>
        </View>
      )}

      {vencidos > 0 && (
        <View style={styles.alertaBanner}>
          <Ionicons name="warning-outline" size={14} color={colors.destructive.default} />
          <Text style={styles.alertaTexto}>{vencidos} pago{vencidos > 1 ? 's' : ''} vencido{vencidos > 1 ? 's' : ''}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  nombre: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
  },
  tipo: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: colors.surface.border,
    marginVertical: spacing.sm,
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  campo: {
    alignItems: 'center',
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    marginBottom: 2,
  },
  valor: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
  },
  progresoContainer: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progresoBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surface.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progresoFill: {
    height: '100%',
    backgroundColor: colors.primary.default,
    borderRadius: borderRadius.full,
  },
  progresoLabel: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    minWidth: 55,
    textAlign: 'right',
  },
  alertaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    backgroundColor: colors.destructive.light,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  alertaTexto: {
    fontSize: fontSize.xs,
    color: colors.destructive.default,
    fontWeight: '500',
  },
});
