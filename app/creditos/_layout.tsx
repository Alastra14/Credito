import { Stack } from 'expo-router';
import { useTheme } from '@/lib/ThemeContext';

export default function CreditosLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Mis Créditos' }} />
      <Stack.Screen name="nuevo" options={{ title: 'Nuevo Crédito' }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
