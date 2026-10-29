import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
// Este SafeAreaView conoce la altura de la barra de pestañas nativa.
import { SafeAreaView } from 'react-native-screens/experimental';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Botón flotante "+" que abre el formulario de nueva transacción. */
export function BotonMas() {
  const theme = useTheme();
  return (
    <SafeAreaView edges={{ bottom: true }} style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <View style={styles.zona} pointerEvents="box-none">
        <Pressable
          onPress={() => router.push('/transaccion')}
          accessibilityLabel="Nueva transacción"
          style={({ pressed }) => [styles.boton, { backgroundColor: theme.accent, transform: [{ scale: pressed ? 0.94 : 1 }] }]}>
          <SymbolView name={{ ios: 'plus', web: 'add' }} size={26} weight="semibold" tintColor="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  zona: { flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end', padding: Spacing.four },
  boton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});
