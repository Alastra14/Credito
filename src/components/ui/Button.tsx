import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator, View,
  StyleSheet, ViewStyle, TextStyle,
} from 'react-native';
import { colors, fontSize, borderRadius, spacing } from '@/lib/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children?: React.ReactNode;
  title?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const variantConfig: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary:     { bg: colors.primary.default, text: '#FFFFFF' },
  secondary:   { bg: colors.primary.light,   text: colors.primary.dark },
  outline:     { bg: 'transparent',          text: colors.primary.default, border: colors.primary.default },
  ghost:       { bg: 'transparent',          text: colors.text.secondary },
  destructive: { bg: colors.destructive.default, text: '#FFFFFF' },
};

const sizeConfig: Record<ButtonSize, { height: number; px: number; fontSize: number }> = {
  sm: { height: 34, px: spacing.md, fontSize: fontSize.sm },
  md: { height: 44, px: spacing.lg, fontSize: fontSize.md },
  lg: { height: 52, px: spacing.xl, fontSize: fontSize.lg },
};

export default function Button({
  children, title, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, style, textStyle, icon,
}: ButtonProps) {
  const v = variantConfig[variant];
  const s = sizeConfig[size];
  const isDisabled = disabled || loading;
  const label = children?.toString() ?? title ?? '';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        {
          backgroundColor: v.bg,
          height: s.height,
          paddingHorizontal: s.px,
          borderWidth: v.border ? 1.5 : 0,
          borderColor: v.border ?? 'transparent',
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <View style={styles.inner}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[styles.text, { color: v.text, fontSize: s.fontSize }, textStyle]}>
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Named export for backward compat
export { Button };

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
});

