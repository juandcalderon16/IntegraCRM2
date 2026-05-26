# Modelo de datos (PostgreSQL)

El esquema inicial se aplica con **Flyway** (`backend/src/main/resources/db/migration/V1__init.sql`).

## Tablas principales

### `roles`

Roles de negocio: `ADMIN`, `VENDEDOR`, `ANALISTA`, `ASESOR_SERVICIO`, `GERENTE`.

### `permissions`

Permisos granulares (`code`), por ejemplo `customers.read`, `prospects.write`, `reports.export`.

### `role_permissions`

Relación N:M entre roles y permisos.

### `users`

Usuarios del CRM: `email`, `password_hash` (nullable si solo Supabase), `full_name`, `supabase_user_id`, `enabled`.

### `user_roles`

Relación N:M usuarios ↔ roles.

### `customers`

Cuentas/contactos: datos demográficos, `status` (`ACTIVE` / `INACTIVE`), `owner_user_id`, `notes`.

### `prospects`

Oportunidades: `title`, `customer_id` opcional, `stage`, `amount`, `currency`, `owner_user_id`, `expected_close_date`.

### `campaigns`

Campañas de marketing: `name`, `channel`, `status`, fechas, `budget`, `description`.

### `campaign_metrics`

Series de métricas por campaña: impresiones, clicks, conversiones, leads, ingresos atribuidos, `recorded_at`.

### `interactions`

Historial con cliente: `customer_id`, `user_id`, `type` (`CALL`, `EMAIL`, `MEETING`, `NOTE`), `summary`, `occurred_at`.

## Diagrama lógico (texto)

```
users ──< user_roles >── roles ──< role_permissions >── permissions

users ──< customers.owner_user_id
users ──< prospects.owner_user_id

customers ──< prospects.customer_id
customers ──< interactions.customer_id
users ──< interactions.user_id

campaigns ──< campaign_metrics
```

## Supabase

Puedes hospedar la base en **Supabase Postgres**: usa la cadena JDBC compatible (`DATABASE_URL`, usuario y contraseña del pool). Las migraciones Flyway siguen siendo el origen de verdad del esquema; alternativamente puedes ejecutar el SQL inicial desde el panel SQL de Supabase antes del primer arranque.
