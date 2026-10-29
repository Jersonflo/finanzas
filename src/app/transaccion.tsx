import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { SelectorFecha } from '@/components/selector-fecha';
import { BotonPrincipal, Chip, Chips, estilosFormulario, Seccion } from '@/components/formulario';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { confirmar } from '@/lib/confirmar';
import { desdeISO, escribirMonto, fechaISO, leerMonto } from '@/lib/formato';
import {
  emojiCuenta,
  supabase,
  type Categoria,
  type Movimiento,
  type SaldoCuenta,
  type TipoMovimiento,
} from '@/lib/supabase';

const TIPOS: { valor: TipoMovimiento; nombre: string }[] = [
  { valor: 'egreso', nombre: 'Gasto' },
  { valor: 'ingreso', nombre: 'Ingreso' },
  { valor: 'transferencia', nombre: 'Transferencia' },
];

/** Crear o editar una transacción. Parámetros: `id` (editar) o `tipo` (abrir ya en ese tipo). */
export default function TransaccionScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ id?: string; tipo?: TipoMovimiento }>();
  const editando = !!params.id;

  const [tipo, setTipo] = useState<TipoMovimiento>(params.tipo ?? 'egreso');
  const [monto, setMonto] = useState(0);
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [cuentaId, setCuentaId] = useState<string | null>(null);
  const [destinoId, setDestinoId] = useState<string | null>(null);
  const [fecha, setFecha] = useState(new Date());

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cuentas, setCuentas] = useState<SaldoCuenta[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Se recargan al volver de "Nueva categoría" o "Nueva cuenta".
  useFocusEffect(
    useCallback(() => {
      supabase.from('categorias').select('*').order('nombre').then(({ data }) => data && setCategorias(data));
      supabase
        .from('saldos_cuentas')
        .select('*')
        .order('nombre')
        .then(({ data }) => {
          if (!data) return;
          setCuentas(data);
          setCuentaId((actual) => actual ?? data[0]?.id ?? null);
        });
    }, []),
  );

  useEffect(() => {
    if (!params.id) return;
    supabase
      .from('movimientos')
      .select('*')
      .eq('id', params.id)
      .single<Movimiento>()
      .then(({ data }) => {
        if (!data) return;
        setTipo(data.tipo);
        setMonto(Number(data.monto));
        setDescripcion(data.descripcion);
        setCategoriaId(data.categoria_id);
        setCuentaId(data.cuenta_id);
        setDestinoId(data.cuenta_destino_id);
        setFecha(desdeISO(data.fecha));
      });
  }, [params.id]);

  function cambiarTipo(nuevo: TipoMovimiento) {
    setTipo(nuevo);
    setCategoriaId(null);
    setError(null);
  }

  const colorTipo = tipo === 'ingreso' ? theme.ingreso : tipo === 'egreso' ? theme.egreso : theme.accent;
  const categoriasDelTipo = categorias.filter((c) => c.tipo === tipo);

  async function guardar() {
    if (monto <= 0) return setError('Escribe el valor.');
    if (!cuentaId) return setError('Elige una cuenta.');
    if (tipo === 'transferencia' && (!destinoId || destinoId === cuentaId)) return setError('Elige una cuenta destino distinta.');
    if (tipo !== 'transferencia' && !categoriaId) return setError('Elige una categoría.');

    setGuardando(true);
    const fila = {
      tipo,
      monto,
      descripcion: descripcion.trim(),
      cuenta_id: cuentaId,
      cuenta_destino_id: tipo === 'transferencia' ? destinoId : null,
      categoria_id: tipo === 'transferencia' ? null : categoriaId,
      fecha: fechaISO(fecha),
    };
    const { error: errorGuardar } = editando
      ? await supabase.from('movimientos').update(fila).eq('id', params.id!)
      : await supabase.from('movimientos').insert(fila);
    setGuardando(false);
    if (errorGuardar) return setError(errorGuardar.message);
    router.back();
  }

  function eliminar() {
    confirmar('¿Eliminar transacción?', 'No se puede deshacer.', 'Eliminar', async () => {
      await supabase.from('movimientos').delete().eq('id', params.id!);
      router.back();
    });
  }

  return (
    <ThemedView style={styles.fill}>
      <Stack.Screen options={{ title: editando ? 'Editar transacción' : 'Nueva transacción' }} />
      <ScrollView
        contentContainerStyle={estilosFormulario.contenido}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets>
        <View style={[styles.segmentos, { backgroundColor: theme.backgroundElement }]}>
          {TIPOS.map((t) => (
            <Pressable
              key={t.valor}
              onPress={() => cambiarTipo(t.valor)}
              style={[styles.segmento, tipo === t.valor && { backgroundColor: colorTipo }]}>
              <ThemedText type="smallBold" style={tipo === t.valor && styles.textoBlanco}>{t.nombre}</ThemedText>
            </Pressable>
          ))}
        </View>

        <View style={styles.montoZona}>
          <ThemedText style={[styles.signo, { color: colorTipo }]}>$</ThemedText>
          <TextInput
            style={[styles.monto, { color: colorTipo }]}
            value={escribirMonto(monto)}
            onChangeText={(t) => setMonto(leerMonto(t))}
            placeholder="0"
            placeholderTextColor={theme.textSecondary}
            keyboardType="number-pad"
            autoFocus={!editando}
          />
        </View>

        <TextInput
          style={[estilosFormulario.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Descripción (opcional): almuerzo, Uber…"
          placeholderTextColor={theme.textSecondary}
        />

        {tipo !== 'transferencia' && (
          <Seccion titulo="Categoría">
            <Chips>
              {categoriasDelTipo.map((c) => (
                <Chip
                  key={c.id}
                  texto={`${c.emoji} ${c.nombre}`}
                  activo={categoriaId === c.id}
                  color={colorTipo}
                  onPress={() => setCategoriaId(c.id)}
                />
              ))}
              <Chip
                texto="＋ Nueva"
                activo={false}
                onPress={() => router.push({ pathname: '/nueva-categoria', params: { tipo } })}
              />
            </Chips>
          </Seccion>
        )}

        <Seccion titulo={tipo === 'transferencia' ? 'Desde la cuenta' : 'Cuenta'}>
          <Chips>
            {cuentas.map((c) => (
              <Chip
                key={c.id}
                texto={`${emojiCuenta(c.tipo)} ${c.nombre}`}
                activo={cuentaId === c.id}
                color={colorTipo}
                onPress={() => setCuentaId(c.id)}
              />
            ))}
            <Chip texto="＋ Nueva" activo={false} onPress={() => router.push('/nueva-cuenta')} />
          </Chips>
        </Seccion>

        {tipo === 'transferencia' && (
          <Seccion titulo="Hacia la cuenta">
            <Chips>
              {cuentas
                .filter((c) => c.id !== cuentaId)
                .map((c) => (
                  <Chip
                    key={c.id}
                    texto={`${emojiCuenta(c.tipo)} ${c.nombre}`}
                    activo={destinoId === c.id}
                    color={colorTipo}
                    onPress={() => setDestinoId(c.id)}
                  />
                ))}
            </Chips>
          </Seccion>
        )}

        <View style={styles.filaFecha}>
          <ThemedText type="small" themeColor="textSecondary">Fecha</ThemedText>
          <View style={styles.fechaDerecha}>
            {fechaISO(fecha) !== fechaISO(new Date()) && (
              <Chip texto="Hoy" activo={false} onPress={() => setFecha(new Date())} />
            )}
            <SelectorFecha valor={fecha} onCambio={setFecha} />
          </View>
        </View>

        {error && <ThemedText type="small" style={[estilosFormulario.error, { color: theme.egreso }]}>{error}</ThemedText>}

        <BotonPrincipal texto={editando ? 'Guardar cambios' : 'Guardar'} onPress={guardar} cargando={guardando} color={colorTipo} />

        {editando && (
          <Pressable onPress={eliminar} style={styles.eliminar}>
            <ThemedText type="small" style={{ color: theme.egreso }}>Eliminar transacción</ThemedText>
          </Pressable>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  segmentos: { flexDirection: 'row', borderRadius: 12, padding: 3 },
  segmento: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  textoBlanco: { color: '#fff' },
  montoZona: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.one },
  signo: { fontSize: 34, lineHeight: 44, fontWeight: 600 },
  monto: { fontSize: 44, fontWeight: 700, minWidth: 60, textAlign: 'center', outlineWidth: 0 },
  filaFecha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fechaDerecha: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  eliminar: { alignSelf: 'center', padding: Spacing.two },
});
