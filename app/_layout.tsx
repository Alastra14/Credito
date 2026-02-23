import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider, useTheme } from '@/lib/ThemeContext';
import { requestNotificationPermissions, scheduleRemindersForAllCreditos } from '@/lib/notifications';
import { getCreditos } from '@/lib/database';
import * as Sentry from '@sentry/react-native';
import CustomTabBar from '@/components/ui/CustomTabBar';
import { ToastProvider } from '@/components/ui/Toast';
import { TabBarProvider } from '@/lib/TabBarContext';
import { LanguageProvider } from '@/lib/LanguageContext';
import { hasSeenOnboarding, setHasSeenOnboarding, hasPin } from '@/lib/auth';
import OnboardingScreen from '@/components/auth/OnboardingScreen';
import LoginScreen from '@/components/auth/LoginScreen';
import { useFonts, SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

Sentry.init({
  dsn: 'https://1ef7421928f5c2c87eedbe05f644f516@o4510921770926080.ingest.us.sentry.io/4510921791176704',
  debug: false, // Set to true to see Sentry logs
});

function RootLayout() {
  const { colors, theme } = useTheme();
  const [isReady, setIsReady] = useState(false);
  const [seenOnboarding, setSeenOnboarding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    async function init() {
      const seen = await hasSeenOnboarding();
      setSeenOnboarding(seen);
      
      const pinExists = await hasPin();
      if (!pinExists && seen) {
        // If they've seen onboarding but have no PIN, they need to set one
        setIsAuthenticated(false);
      }

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
            fechaCorte: c.fechaCorte,
          })),
      );
      setIsReady(true);
    }
    init();
  }, []);

  useEffect(() => {
    if (isReady && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isReady, fontsLoaded]);

  if (!isReady || !fontsLoaded) {
    return null; // Or a splash screen
  }

  if (!seenOnboarding) {
    return (
      <ToastProvider>
        <OnboardingScreen onComplete={async () => {
          await setHasSeenOnboarding(true);
          setSeenOnboarding(true);
        }} />
      </ToastProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <LanguageProvider>
        <ToastProvider>
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} backgroundColor="transparent" translucent />
          <LoginScreen onLogin={() => {
            setTimeout(() => {
              setIsAuthenticated(true);
            }, 400);
          }} />
        </ToastProvider>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <TabBarProvider>
        <ToastProvider>
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} backgroundColor="transparent" translucent />
          <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
              headerStyle: { backgroundColor: colors.surface.background, elevation: 0, shadowOpacity: 0, borderBottomWidth: 0 },
              headerTintColor: colors.text.primary,
              headerTitleStyle: { fontFamily: 'sans-serif-condensed', fontWeight: '900', textTransform: 'uppercase', letterSpacing: -0.5 },
            }}
          >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
          }}
        />
        <Tabs.Screen
          name="creditos"
          options={{
            headerShown: false,
            title: 'Créditos',
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: '',
          }}
        />
        <Tabs.Screen
          name="pagos/index"
          options={{
            title: 'Pagos',
          }}
        />
        <Tabs.Screen
          name="configuracion/index"
          options={{
            title: 'Ajustes',
          }}
        />
        <Tabs.Screen
          name="reportes/index"
          options={{
            href: null,
            title: 'Reportes',
          }}
        />
        <Tabs.Screen
          name="proyecciones/index"
          options={{
            href: null,
            title: 'Proyecciones',
          }}
        />
        <Tabs.Screen
          name="priorizacion/index"
          options={{
            href: null,
            title: 'Priorización',
          }}
        />
      </Tabs>
        </ToastProvider>
      </TabBarProvider>
    </LanguageProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <RootLayout />
    </ThemeProvider>
  );
}

export default Sentry.wrap(App);
