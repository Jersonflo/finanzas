import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Piezas pequeñas que comparten los formularios (transacción, cuenta, categoría). */

export function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={styles.seccion}>
      <ThemedText type="small" themeColor="textSecondary">{titulo}</ThemedText>
      {children}
    </View>
  );
}

export function Chip({
  texto,
  activo,
  onPress,
  color,
}: {
  texto: string;
  activo: boolean;
  onPress: () => void;
  color?: string;
}) {
  const theme = useTheme();
  const fondo = activo ? (color ?? theme.accent) : theme.backgroundElement;
  return (
    <Pressable onPress={onPress} style={[styles.chip, { backgroundColor: fondo }]}>
      <ThemedText type="small" style={activo && styles.textoActivo}>{texto}</ThemedText>
    </Pressable>
  );
}

export function Chips({ children }: { children: ReactNode }) {
  return <View style={styles.chips}>{children}</View>;
}

export function BotonPrincipal({
  texto,
  onPress,
  cargando,
  deshabilitado,
  color,
}: {
  texto: string;
  onPress: () => void;
  cargando?: boolean;
  deshabilitado?: boolean;
  color?: string;
}) {
  const theme = useTheme();
  const apagado = deshabilitado || cargando;
  return (
    <Pressable
      onPress={onPress}
      disabled={apagado}
      style={[styles.boton, { backgroundColor: color ?? theme.accent, opacity: apagado ? 0.5 : 1 }]}>
      {cargando ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.textoBoton}>{texto}</ThemedText>}
    </Pressable>
  );
}

export const estilosFormulario = StyleSheet.create({
  contenido: { padding: Spacing.three, gap: Spacing.four, paddingBottom: Spacing.six },
  input: { borderRadius: 12, paddingHorizontal: Spacing.three, paddingVertical: 14, fontSize: 16, outlineWidth: 0 },
  error: { textAlign: 'center' },
});

const styles = StyleSheet.create({
  seccion: { gap: Spacing.two },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  textoActivo: { color: '#fff', fontWeight: 700 },
  boton: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  textoBoton: { color: '#fff', fontWeight: 700 },
});
