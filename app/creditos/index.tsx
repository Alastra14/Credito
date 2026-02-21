import React, { useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CreditoList from '@/components/creditos/CreditoList';
import { CreditoConPagos } from '@/types';
import { getCreditosConPagos } from '@/lib/database';
import { spacing, borderRadius, shadow } from '@/lib/theme';
import { useTheme } from '@/lib/ThemeContext';

export default function CreditosScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [creditos, setCreditos] = useState<CreditoConPagos[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const lista = await getCreditosConPagos();
      setCreditos(lista);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  return (
    <View style={styles.container}>
      <CreditoList
        creditos={creditos}
        onSelect={c => router.push(`/creditos/${c.id}`)}
        onNuevo={() => router.push('/creditos/nuevo')}
      />
    </View>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.background },
});
}
