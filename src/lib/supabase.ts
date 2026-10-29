import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!url || !key) {
  throw new Error('Faltan EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_KEY en el archivo .env');
}

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Renueva la sesión solo mientras la app está abierta en pantalla.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (estado) => {
    if (estado === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

export type TipoMovimiento = 'ingreso' | 'egreso' | 'transferencia';

export type Movimiento = {
  id: string;
  tipo: TipoMovimiento;
  monto: number;
  descripcion: string;
  fecha: string;
  cuenta_id: string;
  cuenta_destino_id: string | null;
  categoria_id: string | null;
  cuenta: { nombre: string } | null;
  cuenta_destino: { nombre: string } | null;
  categoria: { nombre: string; emoji: string } | null;
};

export const CONSULTA_MOVIMIENTO =
  'id, tipo, monto, descripcion, fecha, cuenta_id, cuenta_destino_id, categoria_id, cuenta:cuentas!movimientos_cuenta_id_fkey(nombre), cuenta_destino:cuentas!movimientos_cuenta_destino_id_fkey(nombre), categoria:categorias(nombre, emoji)';

export type TipoCuenta = 'efectivo' | 'banco' | 'billetera' | 'tarjeta_credito' | 'ahorro';

export type SaldoCuenta = { id: string; nombre: string; tipo: TipoCuenta; saldo: number };

export type Categoria = { id: string; nombre: string; tipo: 'ingreso' | 'egreso'; emoji: string };

export type ResumenCategoria = { categoria: string; emoji: string; tipo: 'ingreso' | 'egreso'; total: number; cantidad: number };

export const TIPOS_CUENTA: { valor: TipoCuenta; nombre: string; emoji: string }[] = [
  { valor: 'banco', nombre: 'Banco', emoji: '🏦' },
  { valor: 'billetera', nombre: 'Billetera digital', emoji: '📱' },
  { valor: 'efectivo', nombre: 'Efectivo', emoji: '💵' },
  { valor: 'ahorro', nombre: 'Ahorro', emoji: '🐷' },
  { valor: 'tarjeta_credito', nombre: 'Tarjeta de crédito', emoji: '💳' },
];

export const emojiCuenta = (tipo: TipoCuenta) => TIPOS_CUENTA.find((t) => t.valor === tipo)?.emoji ?? '💰';
