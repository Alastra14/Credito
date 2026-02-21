import React from 'react';
import {
  View, Text, TextInput, StyleSheet,
  TextInputProps, ViewStyle,
} from 'react-native';
import { fontSize, borderRadius, spacing, shadow } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  hint?: string;
}

export default function Input({ label, error, containerStyle, hint, ...props }: InputProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholderTextColor={colors.text.muted}
        {...props}
      />
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 56,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    backgroundColor: colors.surface.card,
    ...shadow.sm,
  },
  inputError: {
    borderColor: colors.destructive.default,
  },
  error: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.destructive.default,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  hint: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: 6,
  },
});
}
