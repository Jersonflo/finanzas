-- Esquema inicial de Finanzas IA
-- Cada usuario solo ve sus propios datos (RLS por user_id).

-- ───────────── Tablas ─────────────

create table public.cuentas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre text not null,
  tipo text not null default 'banco' check (tipo in ('efectivo', 'banco', 'billetera', 'tarjeta_credito', 'ahorro')),
  saldo_inicial numeric(14, 2) not null default 0,
  creada_en timestamptz not null default now(),
  unique (user_id, nombre)
);

create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre text not null,
  tipo text not null check (tipo in ('ingreso', 'egreso')),
  emoji text not null default '💸',
  unique (user_id, nombre)
);

create table public.movimientos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tipo text not null check (tipo in ('ingreso', 'egreso', 'transferencia')),
  monto numeric(14, 2) not null check (monto > 0),
  cuenta_id uuid not null references public.cuentas (id) on delete cascade,
  cuenta_destino_id uuid references public.cuentas (id) on delete cascade,
  categoria_id uuid references public.categorias (id) on delete set null,
  descripcion text not null default '',
  fecha date not null default (now() at time zone 'America/Bogota')::date,
  creado_en timestamptz not null default now(),
  check (tipo <> 'transferencia' or (cuenta_destino_id is not null and cuenta_destino_id <> cuenta_id))
);

create index movimientos_user_fecha_idx on public.movimientos (user_id, fecha desc);
create index movimientos_cuenta_idx on public.movimientos (cuenta_id);
create index movimientos_cuenta_destino_idx on public.movimientos (cuenta_destino_id);
create index movimientos_categoria_idx on public.movimientos (categoria_id);

-- ───────────── Seguridad (RLS) ─────────────

alter table public.cuentas enable row level security;
alter table public.categorias enable row level security;
alter table public.movimientos enable row level security;

create policy "cuentas propias" on public.cuentas
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "categorias propias" on public.categorias
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "movimientos propios" on public.movimientos
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ───────────── Saldos y resúmenes ─────────────

-- Saldo actual de cada cuenta = saldo inicial + ingresos − egresos ± transferencias
create view public.saldos_cuentas with (security_invoker = true) as
select
  c.id,
  c.nombre,
  c.tipo,
  c.saldo_inicial
    + coalesce(sum(case
        when m.tipo = 'ingreso' and m.cuenta_id = c.id then m.monto
        when m.tipo = 'egreso' and m.cuenta_id = c.id then -m.monto
        when m.tipo = 'transferencia' and m.cuenta_id = c.id then -m.monto
        when m.tipo = 'transferencia' and m.cuenta_destino_id = c.id then m.monto
      end), 0) as saldo
from public.cuentas c
left join public.movimientos m on m.cuenta_id = c.id or m.cuenta_destino_id = c.id
group by c.id;

-- Totales por categoría entre dos fechas (incluidas)
create function public.resumen_por_categoria(desde date, hasta date)
returns table (categoria text, emoji text, tipo text, total numeric, cantidad bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    coalesce(cat.nombre, 'Sin categoría'),
    coalesce(cat.emoji, '❔'),
    m.tipo,
    sum(m.monto),
    count(*)
  from public.movimientos m
  left join public.categorias cat on cat.id = m.categoria_id
  where m.tipo in ('ingreso', 'egreso')
    and m.fecha between desde and hasta
  group by 1, 2, 3
  order by 4 desc;
$$;

-- ───────────── Datos base para cada usuario nuevo ─────────────

create function public.inicializar_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.cuentas (user_id, nombre, tipo) values
    (new.id, 'Efectivo', 'efectivo');

  insert into public.categorias (user_id, nombre, tipo, emoji) values
    (new.id, 'Comida', 'egreso', '🍔'),
    (new.id, 'Mercado', 'egreso', '🛒'),
    (new.id, 'Transporte', 'egreso', '🚌'),
    (new.id, 'Gustos', 'egreso', '🎉'),
    (new.id, 'Ropa', 'egreso', '👕'),
    (new.id, 'Servicios', 'egreso', '💡'),
    (new.id, 'Vivienda', 'egreso', '🏠'),
    (new.id, 'Salud', 'egreso', '💊'),
    (new.id, 'Educación', 'egreso', '📚'),
    (new.id, 'Suscripciones', 'egreso', '📺'),
    (new.id, 'Otros gastos', 'egreso', '💸'),
    (new.id, 'Salario', 'ingreso', '💼'),
    (new.id, 'Ventas', 'ingreso', '🧾'),
    (new.id, 'Otros ingresos', 'ingreso', '💰');

  return new;
end;
$$;

revoke execute on function public.inicializar_usuario() from public, anon, authenticated;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.inicializar_usuario();
