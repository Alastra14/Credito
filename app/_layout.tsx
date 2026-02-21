import React, { useEffect } from 'react';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '@/lib/theme';
import { requestNotificationPermissions, scheduleRemindersForAllCreditos } from '@/lib/notifications';
import { getCreditos } from '@/lib/database';

function CustomDrawerContent(props: DrawerContentComponentProps) {
  return (
    <DrawerContentScrollView {...props} style={styles.drawer}>
      <View style={styles.drawerHeader}>
        <View style={styles.logoCircle}>
          <Ionicons name="wallet" size={28} color="#fff" />
        </View>
        <Text style={styles.drawerTitle}>Mis Créditos</Text>
        <Text style={styles.drawerSubtitle}>Gestión personal</Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function RootLayout() {
  useEffect(() => {
    async function init() {
      await requestNotificationPermissions();
      const cs = await getCreditos();
      await scheduleRemindersForAllCreditos(
        cs
          .filter(c => c.estado === 'activo')
          .map(c => ({
            id: c.id,
            nombre: c.nombre,
            cuotaMensual: c.cuotaMensual ?? c.pagoMinimo ?? 0,
            fechaLimitePago: c.fechaLimitePago,
          })),
      );
    }
    init();
  }, []);

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary.default },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        drawerActiveTintColor: colors.primary.default,
        drawerInactiveTintColor: colors.text.secondary,
        drawerActiveBackgroundColor: colors.primary.light,
        drawerStyle: { backgroundColor: colors.surface.background },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Dashboard',
          drawerLabel: 'Dashboard',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="creditos"
        options={{
          title: 'Mis Créditos',
          drawerLabel: 'Mis Créditos',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="card-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="pagos"
        options={{
          title: 'Pagos',
          drawerLabel: 'Pagos',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="proyecciones"
        options={{
          title: 'Proyecciones',
          drawerLabel: 'Proyecciones',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="trending-down-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="priorizacion"
        options={{
          title: 'Priorización',
          drawerLabel: 'Priorización',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="podium-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="reportes"
        options={{
          title: 'Reportes',
          drawerLabel: 'Reportes',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawer: {
    backgroundColor: colors.surface.background,
  },
  drawerHeader: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
    marginBottom: spacing.sm,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  drawerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text.primary,
  },
  drawerSubtitle: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
});
