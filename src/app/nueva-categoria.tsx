import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { BotonPrincipal, Chip, Chips, estilosFormulario, Seccion } from '@/components/formulario';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

const EMOJIS = [
  '🍔', '☕', '🛒', '🍺', '🚗', '⛽', '🚌', '✈️', '🏠', '💡', '📱', '💻',
  '👕', '👟', '💄', '💇', '💊', '🏋️', '🎮', '🎬', '🎵', '📚', '🎓', '🐶',
  '🎁', '❤️', '👶', '🧾', '💳', '🏦', '💼', '💰', '📈', '🧑‍💻', '🛠️', '💸',
];

export default function NuevaCategoriaScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ tipo?: string }>();
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<'egreso' | 'ingreso'>(params.tipo === 'ingreso' ? 'ingreso' : 'egreso');
  const [emoji, setEmoji] = useState('💸');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    if (!nombre.trim()) return setError('Ponle un nombre a la categoría.');
    setGuardando(true);
    const { error: errorGuardar } = await supabase.from('categorias').insert({ nombre: nombre.trim(), tipo, emoji });
    setGuardando(false);
    if (errorGuardar) {
      return setError(errorGuardar.code === '23505' ? 'Ya existe una categoría con ese nombre.' : errorGuardar.message);
    }
    router.back();
  }

  return (
    <ThemedView style={styles.fill}>
      <ScrollView contentContainerStyle={estilosFormulario.contenido} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <View style={styles.vista}>
          <View style={[styles.emojiGrande, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText style={styles.emojiTexto}>{emoji}</ThemedText>
          </View>
        </View>

        <Seccion titulo="Nombre">
          <TextInput
            style={[estilosFormulario.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Mascotas, Gimnasio, Freelance…"
            placeholderTextColor={theme.textSecondary}
            autoFocus
          />
        </Seccion>

        <Seccion titulo="Es para">
          <Chips>
            <Chip texto="Gastos" activo={tipo === 'egreso'} color={theme.egreso} onPress={() => setTipo('egreso')} />
            <Chip texto="Ingresos" activo={tipo === 'ingreso'} color={theme.ingreso} onPress={() => setTipo('ingreso')} />
          </Chips>
        </Seccion>

        <Seccion titulo="Ícono">
          <View style={styles.rejilla}>
            {EMOJIS.map((e) => (
              <Pressable
                key={e}
                onPress={() => setEmoji(e)}
                style={[styles.celda, { backgroundColor: emoji === e ? theme.backgroundSelected : theme.backgroundElement }]}>
                <ThemedText style={styles.emojiCelda}>{e}</ThemedText>
              </Pressable>
            ))}
          </View>
        </Seccion>

        {error && <ThemedText type="small" style={[estilosFormulario.error, { color: theme.egreso }]}>{error}</ThemedText>}

        <BotonPrincipal texto="Crear categoría" onPress={guardar} cargando={guardando} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  vista: { alignItems: 'center' },
  emojiGrande: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  emojiTexto: { fontSize: 42, lineHeight: 52 },
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  celda: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  emojiCelda: { fontSize: 24, lineHeight: 30 },
});
