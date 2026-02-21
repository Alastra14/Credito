import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { EstadoPago } from '@/types';
import { estadoPagoBgColor, estadoPagoTextColor } from '@/lib/utils';
import { ESTADOS_PAGO_LABEL } from '@/lib/constants';
import { fontSize, borderRadius, spacing } from '@/lib/theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'secondary';

interface BadgeProps {
  children?: React.ReactNode;
  label?: string;
  variant?: BadgeVariant;
  estado?: EstadoPago;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  default:     { bg: '#E2E8F0', text: '#475569' },
  success:     { bg: '#DCFCE7', text: '#15803D' },
  warning:     { bg: '#FEF3C7', text: '#92400E' },
  destructive: { bg: '#FEE2E2', text: '#B91C1C' },
  info:        { bg: '#DBEAFE', text: '#1D4ED8' },
  secondary:   { bg: '#F1F5F9', text: '#475569' },
};

export default function Badge({ children, label, variant = 'default', estado }: BadgeProps) {
  const bgColor = estado ? estadoPagoBgColor(estado) : variantStyles[variant].bg;
  const textColor = estado ? estadoPagoTextColor(estado) : variantStyles[variant].text;
  const displayLabel = estado
    ? ESTADOS_PAGO_LABEL[estado]
    : (children?.toString() ?? label ?? '');

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{displayLabel}</Text>
    </View>
  );
}

// Named export for backward compat
export { Badge };

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});

