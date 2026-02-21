import { Stack } from 'expo-router';
import { colors } from '@/lib/theme';

export default function CreditoIdLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface.card },
        headerTintColor: colors.primary.default,
        headerTitleStyle: { fontWeight: '700', color: colors.text.primary },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Detalle de crédito' }} />
      <Stack.Screen name="editar" options={{ title: 'Editar crédito' }} />
      <Stack.Screen name="pagos" options={{ title: 'Pagos' }} />
      <Stack.Screen name="documentos" options={{ title: 'Documentos' }} />
    </Stack>
  );
}
