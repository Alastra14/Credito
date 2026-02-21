import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { EstadoPago } from '@/types';
import { estadoPagoBgColor, estadoPagoTextColor } from '@/lib/utils';
import { ESTADOS_PAGO_LABEL } from '@/lib/constants';
import { fontSize, borderRadius, spacing } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'secondary';

interface BadgeProps {
  children?: React.ReactNode;
  label?: string;
  variant?: BadgeVariant;
  estado?: EstadoPago;
}

function getVariantStyles(colors: any): Record<BadgeVariant, { bg: string; text: string }> {
  return {
    default:     { bg: colors.surface.border, text: colors.text.primary },
    success:     { bg: colors.success.default, text: colors.success.text },
    warning:     { bg: colors.warning.default, text: colors.warning.text },
    destructive: { bg: colors.destructive.default, text: colors.destructive.text },
    info:        { bg: colors.info.default, text: colors.info.text },
    secondary:   { bg: colors.surface.inverse, text: colors.text.inverse },
  };
}

export default function Badge({ children, label, variant = 'default', estado }: BadgeProps) {
  const { colors } = useTheme();
  const variantStyles = getVariantStyles(colors);
  const bgColor = estado ? estadoPagoBgColor(estado, colors) : variantStyles[variant].bg;
  const textColor = estado ? estadoPagoTextColor(estado, colors) : variantStyles[variant].text;
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
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

