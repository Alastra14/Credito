import React, { useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CreditoList from '@/components/creditos/CreditoList';
import { CreditoConPagos } from '@/types';
import { getCreditos, getCreditoById } from '@/lib/database';
import { colors, spacing, borderRadius, shadow } from '@/lib/theme';

export default function CreditosScreen() {
  const [creditos, setCreditos] = useState<CreditoConPagos[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const lista = await getCreditos();
      const con = await Promise.all(lista.map(c => getCreditoById(c.id)));
      setCreditos(con.filter(Boolean) as CreditoConPagos[]);
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
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/creditos/nuevo')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
  },
});
