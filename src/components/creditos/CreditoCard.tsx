import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CreditoConPagos } from '@/types';
import { spacing, borderRadius, fontSize, shadow } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';
import { formatCurrency, tipoIcon, tipoLabel, estadoPagoColor } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

interface CreditoCardProps {
  credito: CreditoConPagos;
  onPress?: () => void;
}

export default function CreditoCard({ credito, onPress }: CreditoCardProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const pagados = credito.pagos.filter(p => p.estado === 'pagado').length;
  const totalPagos = credito.plazoMeses ?? 0;
  const progreso = totalPagos > 0 ? pagados / totalPagos : 0;

  const vencidos = credito.pagos.filter(p => p.estado === 'vencido').length;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surface.muted }]}>
          <Ionicons
            name={tipoIcon(credito.tipo) as any}
            size={22}
            color={colors.text.primary}
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

function getStyles(colors: any) {
  return StyleSheet.create({
  container: {
    backgroundColor: colors.surface.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    ...shadow.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.background,
  },
  headerInfo: {
    flex: 1,
  },
  nombre: {
    fontSize: fontSize.lg,
    fontWeight: '900',
    color: colors.text.primary,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  tipo: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    marginTop: 4,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  divider: {
    height: 2,
    backgroundColor: colors.surface.border,
    marginVertical: spacing.md,
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  campo: {
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 10,
    color: colors.text.secondary,
    marginBottom: 4,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  valor: {
    fontSize: fontSize.md,
    fontWeight: '900',
    color: colors.text.primary,
    letterSpacing: -0.5,
   fontFamily: 'SpaceGrotesk_700Bold',},
  progresoContainer: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  progresoBar: {
    flex: 1,
    height: 12,
    backgroundColor: colors.surface.background,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progresoFill: {
    height: '100%',
    backgroundColor: colors.primary.default,
  },
  progresoLabel: {
    fontSize: 10,
    color: colors.text.primary,
    minWidth: 60,
    textAlign: 'right',
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  alertaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    backgroundColor: colors.destructive.light,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
  },
  alertaTexto: {
    fontSize: 11,
    color: colors.destructive.default,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
}
