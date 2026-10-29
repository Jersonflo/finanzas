import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BotonMas } from '@/components/boton-mas';
import { SelectorMes } from '@/components/selector-mes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { totales, useMovimientosDelMes } from '@/lib/datos';
import { formatearPesos, inicioDeMes, nombreDia } from '@/lib/formato';
import type { Movimiento } from '@/lib/supabase';

export default function TransaccionesScreen() {
  const theme = useTheme();
  const [mes, setMes] = useState(inicioDeMes);
  const { movimientos, cargando, recargar } = useMovimientosDelMes(mes);

  // Agrupa por día (ya vienen ordenados del más reciente al más viejo).
  const secciones = useMemo(() => {
    const grupos: { fecha: string; data: Movimiento[] }[] = [];
    for (const m of movimientos) {
      const ultimo = grupos[grupos.length - 1];
      if (ultimo?.fecha === m.fecha) ultimo.data.push(m);
      else grupos.push({ fecha: m.fecha, data: [m] });
    }
    return grupos;
  }, [movimientos]);

  const { ingresos, gastos } = totales(movimientos);

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top']}>
        <SectionList
          sections={secciones}
          keyExtractor={(m) => m.id}
          refreshing={cargando}
          onRefresh={recargar}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.lista}
          ListHeaderComponent={
            <View style={styles.encabezado}>
              <ThemedText type="subtitle">Transacciones</ThemedText>
              <SelectorMes mes={mes} onCambio={setMes} />
              <View style={styles.totalesMes}>
                <ThemedText type="small" style={{ color: theme.ingreso }}>Ingresos {formatearPesos(ingresos)}</ThemedText>
                <ThemedText type="small" style={{ color: theme.egreso }}>Gastos {formatearPesos(gastos)}</ThemedText>
              </View>
            </View>
          }
          ListEmptyComponent={
            cargando ? undefined : (
              <ThemedText themeColor="textSecondary" style={styles.vacio}>No hay transacciones en este mes.</ThemedText>
            )
          }
          renderSectionHeader={({ section }) => {
            const neto = totales(section.data).balance;
            return (
              <View style={styles.dia}>
                <ThemedText type="smallBold">{nombreDia(section.fecha)}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {neto > 0 ? '+' : ''}
                  {formatearPesos(neto)}
                </ThemedText>
              </View>
            );
          }}
          renderItem={({ item: m }) => {
            const signo = m.tipo === 'ingreso' ? '+' : m.tipo === 'egreso' ? '−' : '';
            const color = m.tipo === 'ingreso' ? theme.ingreso : m.tipo === 'egreso' ? theme.egreso : theme.text;
            const titulo = m.descripcion || (m.tipo === 'transferencia' ? 'Transferencia' : (m.categoria?.nombre ?? 'Sin categoría'));
            const detalle =
              m.tipo === 'transferencia'
                ? `${m.cuenta?.nombre} → ${m.cuenta_destino?.nombre}`
                : `${m.categoria?.nombre ?? 'Sin categoría'} · ${m.cuenta?.nombre}`;
            return (
              <Pressable
                onPress={() => router.push({ pathname: '/transaccion', params: { id: m.id } })}
                style={({ pressed }) => [styles.fila, { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.7 : 1 }]}>
                <View style={[styles.icono, { backgroundColor: theme.background }]}>
                  <ThemedText style={styles.emoji}>{m.tipo === 'transferencia' ? '🔁' : (m.categoria?.emoji ?? '❔')}</ThemedText>
                </View>
                <View style={styles.centro}>
                  <ThemedText numberOfLines={1}>{titulo}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>{detalle}</ThemedText>
                </View>
                <ThemedText type="smallBold" style={{ color }}>
                  {signo}
                  {formatearPesos(m.monto)}
                </ThemedText>
              </Pressable>
            );
          }}
        />
      </SafeAreaView>
      <BotonMas />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  lista: { padding: Spacing.three, gap: Spacing.two, paddingBottom: 140 },
  encabezado: { gap: Spacing.three, marginBottom: Spacing.two },
  totalesMes: { flexDirection: 'row', justifyContent: 'space-between' },
  vacio: { textAlign: 'center', marginTop: Spacing.five },
  dia: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.three, marginBottom: Spacing.one },
  fila: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, borderRadius: 16, padding: Spacing.three },
  icono: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 20, lineHeight: 26 },
  centro: { flex: 1 },
});
