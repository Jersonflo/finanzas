import { TabList, Tabs, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, type PressableProps, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

// En la web no existen las pestañas nativas de iOS: se dibuja una barra inferior parecida.
export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs style={styles.fill}>
      <TabSlot style={styles.fill} />
      <TabList style={[styles.barra, { backgroundColor: theme.background, borderTopColor: theme.backgroundSelected }]}>
        <TabTrigger name="index" href="/" asChild>
          <Pestana icono="home">Inicio</Pestana>
        </TabTrigger>
        <TabTrigger name="analisis" href="/analisis" asChild>
          <Pestana icono="donut_large">Análisis</Pestana>
        </TabTrigger>
        <TabTrigger name="transacciones" href="/transacciones" asChild>
          <Pestana icono="receipt_long">Transacciones</Pestana>
        </TabTrigger>
        <TabTrigger name="cuentas" href="/cuentas" asChild>
          <Pestana icono="account_balance_wallet">Cuentas</Pestana>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

type SimboloWeb = NonNullable<Extract<SymbolViewProps['name'], object>['web']>;

function Pestana({ children, isFocused, icono, ...props }: TabTriggerSlotProps & { icono: SimboloWeb }) {
  const theme = useTheme();
  const color = isFocused ? theme.accent : theme.textSecondary;
  return (
    <Pressable {...(props as PressableProps)} style={styles.pestana}>
      <View style={[styles.pildora, isFocused && { backgroundColor: theme.backgroundElement }]}>
        <SymbolView name={{ ios: 'circle', web: icono }} size={22} tintColor={color} />
      </View>
      <ThemedText style={[styles.etiqueta, { color }]}>{children}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  barra: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
    // Deja espacio para la barra de gestos del iPhone cuando se abre desde la pantalla de inicio.
    paddingBottom: 'max(8px, env(safe-area-inset-bottom))' as unknown as number,
  },
  pestana: { flex: 1, alignItems: 'center', gap: 2 },
  pildora: { paddingHorizontal: 16, paddingVertical: 3, borderRadius: 999 },
  etiqueta: { fontSize: 11, lineHeight: 14, fontWeight: 600 },
});
