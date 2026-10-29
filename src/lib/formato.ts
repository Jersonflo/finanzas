const pesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const miles = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

export const formatearPesos = (valor: number) => pesos.format(Number(valor));

/** Convierte lo que el usuario escribe ("25.000") en número, y el número en texto con puntos de miles. */
export const leerMonto = (texto: string) => Number(texto.replace(/\D/g, '')) || 0;
export const escribirMonto = (valor: number) => (valor ? miles.format(valor) : '');

/** Fecha local en formato YYYY-MM-DD. */
export function fechaISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dia}`;
}

export function desdeISO(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const inicioDeMes = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1);
export const finDeMes = (d = new Date()) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
export const sumarMeses = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);

export function nombreMes(d: Date) {
  const texto = d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function fechaLegible(iso: string) {
  return desdeISO(iso).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
}

/** "Hoy", "Ayer" o "martes 21 de octubre". */
export function nombreDia(iso: string) {
  const hoy = fechaISO(new Date());
  const ayer = fechaISO(new Date(Date.now() - 86_400_000));
  if (iso === hoy) return 'Hoy';
  if (iso === ayer) return 'Ayer';
  const texto = desdeISO(iso).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
