import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { PaletaCategorias } from '@/constants/theme';
import { fechaISO, finDeMes, inicioDeMes } from '@/lib/formato';
import { CONSULTA_MOVIMIENTO, supabase, type Movimiento } from '@/lib/supabase';

/** Movimientos de un mes. Se recargan cada vez que la pantalla vuelve a verse (p. ej. tras guardar uno). */
export function useMovimientosDelMes(mes: Date) {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [cargando, setCargando] = useState(false);
  const desde = fechaISO(inicioDeMes(mes));
  const hasta = fechaISO(finDeMes(mes));

  const recargar = useCallback(async () => {
    setCargando(true);
    const { data } = await supabase
      .from('movimientos')
      .select(CONSULTA_MOVIMIENTO)
      .gte('fecha', desde)
      .lte('fecha', hasta)
      .order('fecha', { ascending: false })
      .order('creado_en', { ascending: false })
      .returns<Movimiento[]>();
    if (data) setMovimientos(data);
    setCargando(false);
  }, [desde, hasta]);

  useFocusEffect(
    useCallback(() => {
      recargar();
    }, [recargar]),
  );

  return { movimientos, cargando, recargar };
}

export function totales(movimientos: Movimiento[]) {
  let ingresos = 0;
  let gastos = 0;
  for (const m of movimientos) {
    if (m.tipo === 'ingreso') ingresos += Number(m.monto);
    if (m.tipo === 'egreso') gastos += Number(m.monto);
  }
  return { ingresos, gastos, balance: ingresos - gastos };
}

export type TotalCategoria = { nombre: string; emoji: string; total: number; cantidad: number; color: string };

/** Suma por categoría, de mayor a menor, con un color fijo por posición. */
export function porCategoria(movimientos: Movimiento[], tipo: 'ingreso' | 'egreso'): TotalCategoria[] {
  const mapa = new Map<string, { nombre: string; emoji: string; total: number; cantidad: number }>();
  for (const m of movimientos) {
    if (m.tipo !== tipo) continue;
    const nombre = m.categoria?.nombre ?? 'Sin categoría';
    const actual = mapa.get(nombre) ?? { nombre, emoji: m.categoria?.emoji ?? '❔', total: 0, cantidad: 0 };
    actual.total += Number(m.monto);
    actual.cantidad += 1;
    mapa.set(nombre, actual);
  }
  return [...mapa.values()]
    .sort((a, b) => b.total - a.total)
    .map((c, i) => ({ ...c, color: PaletaCategorias[i % PaletaCategorias.length] }));
}
