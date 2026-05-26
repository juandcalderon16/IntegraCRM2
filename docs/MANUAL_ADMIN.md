# Manual básico — Administrador

## Acceso

1. Abre la aplicación web (por ejemplo `http://localhost:8081` con Docker Compose, o `http://localhost:5173` en desarrollo con Vite).
2. Inicia sesión con una cuenta **ADMIN** (demo local: `admin@crm.local` / `password`).

## Usuarios y roles

1. Ve a **Administración** en el menú lateral.
2. Revisa la tabla de usuarios y la lista de **roles disponibles** (`ADMIN`, `VENDEDOR`, `ANALISTA`, `ASESOR_SERVICIO`, `GERENTE`).
3. Para crear un usuario:
   - Pulsa **Nuevo usuario**.
   - Completa correo, nombre y contraseña inicial (opcional si enlazarás solo Supabase más adelante).
   - Indica roles separados por coma (ej. `VENDEDOR`).
4. Los permisos efectivos son la unión de los permisos de todos los roles del usuario (definidos en base de datos).

## Reportes ejecutivos

Las cuentas con permiso `reports.export` (rol **GERENTE** en la semilla) pueden descargar desde el **Dashboard**:

- PDF del resumen de indicadores.
- Excel del dashboard.
- Excel del listado de clientes.

## Supabase Auth

1. Crea el usuario en Supabase y obtén su UUID (`sub`) del JWT.
2. En la tabla `users` del CRM, asigna `supabase_user_id` o asegura que el **email** coincide.
3. Configura `SUPABASE_JWK_SET_URI` (y opcionalmente `SUPABASE_JWT_ISSUER`) en el backend para aceptar tokens emitidos por Supabase además del JWT local.

## Docker Compose

Desde la carpeta `docker/`:

```bash
docker compose up --build
```

- Frontend: puerto **8081**.
- API directa (opcional): **8080**.
- Postgres: **5432** (persistencia en volumen `pgdata`).
