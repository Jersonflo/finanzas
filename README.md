# Finanzas

Proyecto personal: una app de iPhone para llevar el control de mis finanzas personales. Registro gastos, ingresos y transferencias entre cuentas, y veo en qué se va la plata cada mes.

**Pruébala:** [jersonflo.github.io/finanzas](https://jersonflo.github.io/finanzas/). En el iPhone, ábrela en Safari y usa *Compartir → Agregar a pantalla de inicio*.

## Qué hace
- **Inicio:** saldo del mes con barras de ingresos y gastos, y gastos por categoría. Botón **+** para registrar una transacción.
- **Análisis:** gráfica de dona por categoría, promedio diario y comparación entre meses.
- **Transacciones:** todos los movimientos agrupados por día, con edición y borrado.
- **Cuentas:** valor neto, saldo de cada cuenta (bancos, billeteras, efectivo, tarjetas) y transferencias entre ellas.
- Categorías por defecto y categorías propias con ícono.

## Tecnologías
- **Expo / React Native** con Expo Router y pestañas nativas de iOS
- **Supabase** (Postgres + autenticación) con seguridad por fila (RLS): cada usuario solo ve sus datos
- **TypeScript**
