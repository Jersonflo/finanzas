import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Dona } from '@/components/dona';
import { Chip, Chips } from '@/components/formulario';
import { SelectorMes } from '@/components/selector-mes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { porCategoria, useMovimientosDelMes } from '@/lib/datos';
import { finDeMes, formatearPesos, inicioDeMes } from '@/lib/formato';

export default function AnalisisScreen() {
  const theme = useTheme();
  const [mes, setMes] = useState(inicioDeMes);
  const [tipo, setTipo] = useState<'egreso' | 'ingreso'>('egreso');
  const { movimientos, cargando, recargar } = useMovimientosDelMes(mes);

  const categorias = useMemo(() => porCategoria(movimientos, tipo), [movimientos, tipo]);
  const total = categorias.reduce((s, c) => s + c.total, 0);
  const cantidad = categorias.reduce((s, c) => s + c.cantidad, 0);

  // Promedio diario: en el mes actual se divide por los días que van; en meses pasados, por todos.
  const hoy = new Date();
  const esMesActual = mes.getTime() === inicioDeMes(hoy).getTime();
  const dias = esMesActual ? hoy.getDate() : finDeMes(mes).getDate();
  const etiqueta = tipo === 'egreso' ? 'Gastos' : 'Ingresos';

  const tarjeta = [styles.tarjeta, { backgroundColor: theme.backgroundElement }];

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.contenido}
          refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}>
          <ThemedText type="subtitle">Análisis</ThemedText>
          <SelectorMes mes={mes} onCambio={setMes} />

          <Chips>
            <Chip texto="Gastos" activo={tipo === 'egreso'} color={theme.egreso} onPress={() => setTipo('egreso')} />
            <Chip texto="Ingresos" activo={tipo === 'ingreso'} color={theme.ingreso} onPress={() => setTipo('ingreso')} />
          </Chips>

          <View style={[tarjeta, styles.centrado]}>
            <Dona porciones={categorias.map((c) => ({ valor: c.total, color: c.color }))} titulo={etiqueta} valor={formatearPesos(total)} />
          </View>

          <View style={styles.estadisticas}>
            <View style={[tarjeta, styles.estadistica]}>
              <ThemedText type="small" themeColor="textSecondary">Promedio diario</ThemedText>
              <ThemedText type="smallBold">{formatearPesos(dias ? total / dias : 0)}</ThemedText>
            </View>
            <View style={[tarjeta, styles.estadistica]}>
              <ThemedText type="small" themeColor="textSecondary">Transacciones</ThemedText>
              <ThemedText type="smallBold">{cantidad}</ThemedText>
            </View>
          </View>

          <View style={tarjeta}>
            <ThemedText type="smallBold">{etiqueta} por categoría</ThemedText>
            {categorias.length === 0 && (
              <ThemedText type="small" themeColor="textSecondary">No hay {etiqueta.toLowerCase()} en este mes.</ThemedText>
            )}
            {categorias.map((c) => (
              <View key={c.nombre} style={styles.fila}>
                <View style={[styles.punto, { backgroundColor: c.color }]} />
                <View style={styles.centro}>
                  <ThemedText type="small">{c.emoji} {c.nombre}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {c.cantidad} {c.cantidad === 1 ? 'transacción' : 'transacciones'}
                  </ThemedText>
                </View>
                <View style={styles.derecha}>
                  <ThemedText type="smallBold">{formatearPesos(c.total)}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">{Math.round((c.total / total) * 100)}%</ThemedText>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  contenido: { padding: Spacing.three, gap: Spacing.three, paddingBottom: 120 },
  tarjeta: { borderRadius: 20, padding: Spacing.three, gap: Spacing.three },
  centrado: { alignItems: 'center', paddingVertical: Spacing.four },
  estadisticas: { flexDirection: 'row', gap: Spacing.three },
  estadistica: { flex: 1, gap: Spacing.one },
  fila: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  punto: { width: 12, height: 12, borderRadius: 6 },
  centro: { flex: 1 },
  derecha: { alignItems: 'flex-end' },
});
