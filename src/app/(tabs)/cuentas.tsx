import { router, useFocusEffect } from 'expo-router';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatearPesos } from '@/lib/formato';
import { emojiCuenta, supabase, TIPOS_CUENTA, type SaldoCuenta } from '@/lib/supabase';

export default function CuentasScreen() {
  const theme = useTheme();
  const [cuentas, setCuentas] = useState<SaldoCuenta[]>([]);
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    const { data } = await supabase.from('saldos_cuentas').select('*').order('nombre');
    if (data) setCuentas(data);
    setCargando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  const valorNeto = cuentas.reduce((s, c) => s + Number(c.saldo), 0);
  const activos = cuentas.filter((c) => Number(c.saldo) > 0).reduce((s, c) => s + Number(c.saldo), 0);
  const deudas = cuentas.filter((c) => Number(c.saldo) < 0).reduce((s, c) => s + Number(c.saldo), 0);

  const tarjeta = [styles.tarjeta, { backgroundColor: theme.backgroundElement }];

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top']}>
        <ScrollView contentContainerStyle={styles.contenido} refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} />}>
          <ThemedText type="subtitle">Cuentas</ThemedText>

          <View style={[tarjeta, { backgroundColor: theme.accent }]}>
            <ThemedText type="small" style={styles.blancoSuave}>Valor neto</ThemedText>
            <ThemedText style={styles.valorNeto}>{formatearPesos(valorNeto)}</ThemedText>
            <View style={styles.fila}>
              <ThemedText type="small" style={styles.blancoSuave}>Tienes {formatearPesos(activos)}</ThemedText>
              {deudas < 0 && <ThemedText type="small" style={styles.blancoSuave}>Debes {formatearPesos(-deudas)}</ThemedText>}
            </View>
          </View>

          <View style={styles.acciones}>
            <BotonAccion icono="plus" texto="Nueva cuenta" onPress={() => router.push('/nueva-cuenta')} />
            <BotonAccion
              icono="arrow.left.arrow.right"
              texto="Transferir"
              onPress={() => router.push({ pathname: '/transaccion', params: { tipo: 'transferencia' } })}
            />
          </View>

          <View style={tarjeta}>
            {cuentas.length === 0 && !cargando && (
              <ThemedText type="small" themeColor="textSecondary">Aún no tienes cuentas. Crea la primera.</ThemedText>
            )}
            {cuentas.map((c, i) => (
              <View
                key={c.id}
                style={[styles.cuenta, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.backgroundSelected }]}>
                <View style={[styles.icono, { backgroundColor: theme.background }]}>
                  <ThemedText style={styles.emoji}>{emojiCuenta(c.tipo)}</ThemedText>
                </View>
                <View style={styles.centro}>
                  <ThemedText>{c.nombre}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {TIPOS_CUENTA.find((t) => t.valor === c.tipo)?.nombre}
                  </ThemedText>
                </View>
                <ThemedText type="smallBold" style={{ color: Number(c.saldo) < 0 ? theme.egreso : theme.text }}>
                  {formatearPesos(c.saldo)}
                </ThemedText>
              </View>
            ))}
          </View>

          <Pressable onPress={() => supabase.auth.signOut()} style={styles.salir}>
            <ThemedText type="small" themeColor="textSecondary">Cerrar sesión</ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function BotonAccion({ icono, texto, onPress }: { icono: SFSymbol; texto: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.accion, { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 }]}>
      <SymbolView name={icono} size={18} weight="semibold" tintColor={theme.accent} />
      <ThemedText type="smallBold">{texto}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  contenido: { padding: Spacing.three, gap: Spacing.three, paddingBottom: 120 },
  tarjeta: { borderRadius: 20, padding: Spacing.three, gap: Spacing.two },
  blancoSuave: { color: 'rgba(255,255,255,0.85)' },
  valorNeto: { color: '#fff', fontSize: 34, lineHeight: 40, fontWeight: 700 },
  fila: { flexDirection: 'row', justifyContent: 'space-between' },
  acciones: { flexDirection: 'row', gap: Spacing.three },
  accion: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: 16,
    paddingVertical: 14,
  },
  cuenta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.two },
  icono: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 20, lineHeight: 26 },
  centro: { flex: 1 },
  salir: { alignSelf: 'center', padding: Spacing.two },
});
