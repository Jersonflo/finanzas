# Finanzas

App de iPhone para llevar tus gastos, ingresos y cuentas, inspirada en Fleur pero gratis y tuya.

- **App:** Expo (React Native), corre en el iPhone con Expo Go
- **Base de datos y login:** Supabase (Postgres)

## Pestañas
- **Inicio:** saldo del mes con barras de ingresos y gastos, y gastos por categoría. Botón **+** para agregar una transacción.
- **Análisis:** gráfica de dona por categoría (gastos o ingresos), promedio diario y número de transacciones; puedes ir a meses anteriores.
- **Transacciones:** todo lo del mes agrupado por día. Toca una para editarla o borrarla.
- **Cuentas:** valor neto, saldo de cada cuenta, crear cuentas y transferir entre ellas.

## Puesta en marcha (una sola vez)

### 1. Proyecto de Supabase
1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor**, pega todo el contenido de `supabase/migrations/20261025000000_esquema_inicial.sql` y dale **Run**.
3. (Opcional, más cómodo) **Authentication → Sign In / Providers → Email** y desactiva *Confirm email*.

### 2. Conectar la app
Copia `.env.example` como `.env` y pon la URL y la *publishable key* del proyecto (**Project Settings → API Keys**).

### 3. Abrir en el iPhone
1. Instala **Expo Go** desde la App Store e inicia sesión con tu cuenta de Expo.
2. En el PC, dentro de esta carpeta:

```bash
npx expo login --no-browser
```

```bash
npm start
```

3. Escanea el QR con la cámara del iPhone. El PC y el celular deben estar en el mismo Wi-Fi; si no conecta, usa `npx expo start --tunnel`.

## Estructura
- `src/app/(tabs)/`: las 4 pestañas (`index` = Inicio, `analisis`, `transacciones`, `cuentas`)
- `src/app/transaccion.tsx`: formulario para crear o editar una transacción
- `src/app/nueva-cuenta.tsx`, `src/app/nueva-categoria.tsx`: formularios
- `src/components/`: botón +, dona, barra de progreso, selector de mes, piezas de formulario, login
- `src/lib/`: conexión a Supabase, consultas y formato de pesos/fechas
- `supabase/migrations/`: tablas, seguridad (RLS) y categorías por defecto
