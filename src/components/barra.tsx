import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** Barra de progreso; `progreso` va de 0 a 1. */
export function Barra({ progreso, color, alto = 8 }: { progreso: number; color: string; alto?: number }) {
  const theme = useTheme();
  const ancho = `${Math.min(Math.max(progreso, 0), 1) * 100}%` as const;
  return (
    <View style={[styles.fondo, { height: alto, borderRadius: alto / 2, backgroundColor: theme.backgroundSelected }]}>
      <View style={{ width: ancho, height: alto, borderRadius: alto / 2, backgroundColor: color }} />
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { overflow: 'hidden' },
});
