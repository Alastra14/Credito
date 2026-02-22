import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';

interface Props {
  size?: number;
}

export default function Logo({ size = 60 }: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors, size);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../../assets/debtlessLogo1.png')} 
        style={{ width: size, height: size, borderRadius: size / 2, resizeMode: 'cover' }} 
      />
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
