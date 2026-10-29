import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { inicioDeMes, nombreMes, sumarMeses } from '@/lib/formato';

/** "‹ Octubre de 2026 ›" para moverse entre meses. No deja pasar del mes actual. */
export function SelectorMes({ mes, onCambio }: { mes: Date; onCambio: (mes: Date) => void }) {
  const theme = useTheme();
  const esMesActual = mes.getTime() >= inicioDeMes().getTime();

  return (
    <View style={[styles.contenedor, { backgroundColor: theme.backgroundElement }]}>
      <Pressable onPress={() => onCambio(sumarMeses(mes, -1))} hitSlop={10} style={styles.flecha}>
        <SymbolView name={{ ios: 'chevron.left', web: 'chevron_left' }} size={16} weight="semibold" tintColor={theme.text} />
      </Pressable>
      <ThemedText type="smallBold">{nombreMes(mes)}</ThemedText>
      <Pressable
        onPress={() => onCambio(sumarMeses(mes, 1))}
        disabled={esMesActual}
        hitSlop={10}
        style={[styles.flecha, { opacity: esMesActual ? 0.25 : 1 }]}>
        <SymbolView name={{ ios: 'chevron.right', web: 'chevron_right' }} size={16} weight="semibold" tintColor={theme.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  flecha: { padding: Spacing.two },
});
