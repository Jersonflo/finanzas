import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Barra } from '@/components/barra';
import { BotonMas } from '@/components/boton-mas';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { porCategoria, totales, useMovimientosDelMes } from '@/lib/datos';
import { formatearPesos, inicioDeMes, nombreMes } from '@/lib/formato';

export default function InicioScreen() {
  const theme = useTheme();
  const [mes] = useState(inicioDeMes);
  const { movimientos, cargando, recargar } = useMovimientosDelMes(mes);

  const { ingresos, gastos, balance } = totales(movimientos);
  const categorias = useMemo(() => porCategoria(movimientos, 'egreso'), [movimientos]);
  const maximo = Math.max(ingresos, gastos, 1);
  const porcentajeGastado = ingresos > 0 ? Math.round((gastos / ingresos) * 100) : null;

  const tarjeta = [styles.tarjeta, { backgroundColor: theme.backgroundElement }];

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.contenido}
          refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}>
          <View>
            <ThemedText type="small" themeColor="textSecondary">{nombreMes(mes)}</ThemedText>
            <ThemedText type="subtitle">Resumen</ThemedText>
          </View>

          <View style={tarjeta}>
            <ThemedText type="small" themeColor="textSecondary">Saldo del mes</ThemedText>
            <ThemedText style={[styles.balance, { color: balance < 0 ? theme.egreso : theme.text }]}>
              {formatearPesos(balance)}
            </ThemedText>

            <View style={styles.renglon}>
              <View style={styles.fila}>
                <ThemedText type="small">⬆️ Ingresos</ThemedText>
                <ThemedText type="smallBold" style={{ color: theme.ingreso }}>{formatearPesos(ingresos)}</ThemedText>
              </View>
              <Barra progreso={ingresos / maximo} color={theme.ingreso} />
            </View>

            <View style={styles.renglon}>
              <View style={styles.fila}>
                <ThemedText type="small">⬇️ Gastos</ThemedText>
                <ThemedText type="smallBold" style={{ color: theme.egreso }}>{formatearPesos(gastos)}</ThemedText>
              </View>
              <Barra progreso={gastos / maximo} color={theme.egreso} />
            </View>

            {porcentajeGastado !== null && (
              <ThemedText type="small" themeColor="textSecondary">
                Has gastado el {porcentajeGastado}% de lo que ganaste este mes.
              </ThemedText>
            )}
          </View>

          <View style={tarjeta}>
            <ThemedText type="smallBold">Gastos por categoría</ThemedText>
            {categorias.length === 0 && (
              <ThemedText type="small" themeColor="textSecondary">
                Aún no hay gastos este mes. Toca el botón + para agregar uno.
              </ThemedText>
            )}
            {categorias.map((c) => (
              <View key={c.nombre} style={styles.renglon}>
                <View style={styles.fila}>
                  <ThemedText type="small">{c.emoji} {c.nombre}</ThemedText>
                  <ThemedText type="smallBold">{formatearPesos(c.total)}</ThemedText>
                </View>
                <Barra progreso={gastos ? c.total / gastos : 0} color={c.color} alto={6} />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
      <BotonMas />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  contenido: { padding: Spacing.three, gap: Spacing.three, paddingBottom: 140 },
  tarjeta: { borderRadius: 20, padding: Spacing.three, gap: Spacing.three },
  balance: { fontSize: 34, lineHeight: 40, fontWeight: 700 },
  renglon: { gap: Spacing.one },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
