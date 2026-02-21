import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/ThemeContext';

interface Props {
  size?: number;
}

export default function Logo({ size = 60 }: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors, size);

  return (
    <View style={styles.container}>
      <Ionicons name="shield-checkmark" size={size * 0.6} color={colors.primary.default} />
    </View>
  );
}

function getStyles(colors: any, size: number) {
  return StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: colors.surface.card,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  });
}
