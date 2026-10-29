import type { Session } from '@supabase/supabase-js';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { Login } from '@/components/login';
import { supabase } from '@/lib/supabase';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // undefined = todavía revisando si hay sesión guardada
  const [sesion, setSesion] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSesion(data.session));
    const { data } = supabase.auth.onAuthStateChange((_evento, nueva) => setSesion(nueva));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (sesion !== undefined) SplashScreen.hideAsync();
  }, [sesion]);

  if (sesion === undefined) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {sesion ? (
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="transaccion" options={{ presentation: 'modal', title: 'Nueva transacción' }} />
          <Stack.Screen name="nueva-cuenta" options={{ presentation: 'modal', title: 'Nueva cuenta' }} />
          <Stack.Screen name="nueva-categoria" options={{ presentation: 'modal', title: 'Nueva categoría' }} />
        </Stack>
      ) : (
        <Login />
      )}
    </ThemeProvider>
  );
}
