import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput } from 'react-native';

import { BotonPrincipal, Chip, Chips, estilosFormulario, Seccion } from '@/components/formulario';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { escribirMonto, leerMonto } from '@/lib/formato';
import { supabase, TIPOS_CUENTA, type TipoCuenta } from '@/lib/supabase';

export default function NuevaCuentaScreen() {
  const theme = useTheme();
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<TipoCuenta>('banco');
  const [saldo, setSaldo] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esTarjeta = tipo === 'tarjeta_credito';
  const input = [estilosFormulario.input, { backgroundColor: theme.backgroundElement, color: theme.text }];

  async function guardar() {
    if (!nombre.trim()) return setError('Ponle un nombre a la cuenta.');
    setGuardando(true);
    // En una tarjeta de crédito lo que se escribe es la deuda, por eso queda en negativo.
    const { error: errorGuardar } = await supabase
      .from('cuentas')
      .insert({ nombre: nombre.trim(), tipo, saldo_inicial: esTarjeta ? -saldo : saldo });
    setGuardando(false);
    if (errorGuardar) {
      return setError(errorGuardar.code === '23505' ? 'Ya tienes una cuenta con ese nombre.' : errorGuardar.message);
    }
    router.back();
  }

  return (
    <ThemedView style={styles.fill}>
      <ScrollView contentContainerStyle={estilosFormulario.contenido} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <Seccion titulo="Nombre">
          <TextInput
            style={input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Bancolombia, Nequi, Davivienda…"
            placeholderTextColor={theme.textSecondary}
            autoFocus
          />
        </Seccion>

        <Seccion titulo="Tipo">
          <Chips>
            {TIPOS_CUENTA.map((t) => (
              <Chip key={t.valor} texto={`${t.emoji} ${t.nombre}`} activo={tipo === t.valor} onPress={() => setTipo(t.valor)} />
            ))}
          </Chips>
        </Seccion>

        <Seccion titulo={esTarjeta ? '¿Cuánto debes hoy en la tarjeta?' : '¿Cuánto tienes hoy en esta cuenta?'}>
          <TextInput
            style={input}
            value={escribirMonto(saldo)}
            onChangeText={(t) => setSaldo(leerMonto(t))}
            placeholder="$ 0"
            placeholderTextColor={theme.textSecondary}
            keyboardType="number-pad"
          />
        </Seccion>

        {error && <ThemedText type="small" style={[estilosFormulario.error, { color: theme.egreso }]}>{error}</ThemedText>}

        <BotonPrincipal texto="Crear cuenta" onPress={guardar} cargando={guardando} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
