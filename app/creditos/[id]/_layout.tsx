import { Stack } from 'expo-router';
import { useTheme } from '@/lib/ThemeContext';

export default function CreditoIdLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface.background },
        headerTintColor: colors.text.primary,
        headerTitleStyle: { fontWeight: '900' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.surface.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Detalle de crédito' }} />
      <Stack.Screen name="editar" options={{ title: 'Editar crédito' }} />
    </Stack>
  );
}
