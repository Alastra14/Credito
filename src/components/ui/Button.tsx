import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator, View,
  StyleSheet, ViewStyle, TextStyle, StyleProp,
} from 'react-native';
import { fontSize, borderRadius, spacing } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

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
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

function getVariantConfig(colors: any): Record<ButtonVariant, { bg: string; text: string; border?: string }> {
  return {
  primary:     { bg: colors.surface.inverse, text: colors.text.inverse },
  secondary:   { bg: colors.surface.card,   text: colors.text.primary, border: colors.surface.border },
  outline:     { bg: 'transparent',          text: colors.text.primary, border: colors.text.primary },
  ghost:       { bg: 'transparent',          text: colors.text.secondary },
  destructive: { bg: colors.destructive.default, text: colors.text.inverse },
};
}

const sizeConfig: Record<ButtonSize, { height: number; px: number; fontSize: number }> = {
  sm: { height: 36, px: spacing.md, fontSize: fontSize.sm },
  md: { height: 48, px: spacing.lg, fontSize: fontSize.md },
  lg: { height: 56, px: spacing.xl, fontSize: fontSize.lg },
};

export default function Button({
  children, title, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, style, textStyle, icon,
}: ButtonProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const variantConfig = getVariantConfig(colors);
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

function getStyles(colors: any) {
  return StyleSheet.create({
  base: {
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
}

