import { Stack } from 'expo-router';
import { colors } from '@/lib/theme';
export default function CreditosLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary.default },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Mis Créditos' }} />
      <Stack.Screen name="nuevo" options={{ title: 'Nuevo Crédito' }} />
      <Stack.Screen name="[id]/index" options={{ title: 'Detalle del Crédito' }} />
      <Stack.Screen name="[id]/editar" options={{ title: 'Editar Crédito' }} />
      <Stack.Screen name="[id]/pagos" options={{ title: 'Pagos del Crédito' }} />
      <Stack.Screen name="[id]/documentos" options={{ title: 'Documentos' }} />
    </Stack>
  );
}
