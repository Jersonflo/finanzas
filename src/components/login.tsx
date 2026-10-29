import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

export function Login() {
  const theme = useTheme();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [modo, setModo] = useState<'entrar' | 'registro'>('entrar');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function enviar() {
    setCargando(true);
    setMensaje(null);
    const credenciales = { email: correo.trim(), password: clave };
    const { data, error } =
      modo === 'entrar'
        ? await supabase.auth.signInWithPassword(credenciales)
        : await supabase.auth.signUp(credenciales);
    setCargando(false);
    if (error) setMensaje(error.message);
    else if (modo === 'registro' && !data.session) setMensaje('Revisa tu correo para confirmar la cuenta y luego entra.');
  }

  const input = [styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }];

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.contenido}>
          <ThemedText type="subtitle">Finanzas</ThemedText>
          <ThemedText themeColor="textSecondary">Lleva tus gastos, ingresos y cuentas en un solo lugar.</ThemedText>

          <TextInput
            style={input}
            placeholder="Correo"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={correo}
            onChangeText={setCorreo}
          />
          <TextInput
            style={input}
            placeholder="Contraseña"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
            value={clave}
            onChangeText={setClave}
          />

          <Pressable
            style={[styles.boton, { backgroundColor: theme.accent, opacity: cargando ? 0.6 : 1 }]}
            onPress={enviar}
            disabled={cargando || !correo || clave.length < 6}>
            {cargando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.textoBoton}>{modo === 'entrar' ? 'Entrar' : 'Crear cuenta'}</ThemedText>
            )}
          </Pressable>

          {mensaje && <ThemedText type="small" themeColor="textSecondary">{mensaje}</ThemedText>}

          <Pressable onPress={() => setModo(modo === 'entrar' ? 'registro' : 'entrar')}>
            <ThemedText type="linkPrimary">
              {modo === 'entrar' ? '¿No tienes cuenta? Créala' : '¿Ya tienes cuenta? Entra'}
            </ThemedText>
          </Pressable>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  contenido: { flex: 1, justifyContent: 'center', padding: Spacing.four, gap: Spacing.three },
  input: { borderRadius: 12, paddingHorizontal: Spacing.three, paddingVertical: 14, fontSize: 16, outlineWidth: 0 },
  boton: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  textoBoton: { color: '#fff', fontWeight: 700 },
});
