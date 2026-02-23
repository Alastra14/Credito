import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList,
  StyleSheet, ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fontSize, borderRadius, spacing, shadow } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export default function Select({
  label, value, onChange, options, placeholder = 'Seleccionar...',
  error, containerStyle,
}: SelectProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity
        style={[styles.trigger, error ? styles.triggerError : null]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={selected ? styles.value : styles.placeholder}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.text.muted} />
      </TouchableOpacity>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.dropdown}>
            <FlatList
              data={options}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, item.value === value && styles.optionSelected]}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, item.value === value && styles.optionTextSelected]}>
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Ionicons name="checkmark" size={18} color={colors.primary.default} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: {
    fontSize: fontSize.sm, fontWeight: '800',
    color: colors.text.primary, marginBottom: spacing.sm,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  trigger: {
    height: 56,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface.card,
    ...shadow.sm,
  },
  triggerError: { borderColor: colors.destructive.default, borderWidth: 2 },
  value: { fontSize: fontSize.md, fontWeight: '600', color: colors.text.primary },
  placeholder: { fontSize: fontSize.md, fontWeight: '600', color: colors.text.muted },
  error: { fontSize: fontSize.xs, fontWeight: '700', color: colors.destructive.default, marginTop: 6, textTransform: 'uppercase' },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', padding: spacing.xl,
  },
  dropdown: {
    backgroundColor: colors.surface.card,
    borderRadius: borderRadius.xl,
    maxHeight: 320,
    borderWidth: 1, borderColor: colors.surface.border,
    ...shadow.md,
  },
  option: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.surface.border,
  },
  optionSelected: { backgroundColor: colors.surface.muted },
  optionText: { fontSize: fontSize.md, fontWeight: '600', color: colors.text.primary },
  optionTextSelected: { color: colors.text.primary, fontWeight: '900' },
});
}
