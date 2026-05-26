# Documentación de API (REST y GraphQL)

Base URL local: `http://localhost:8080` (backend directo) o, con Docker del frontend, rutas relativas `/api` y `/graphql` detrás de Nginx en el puerto **8081**.

Autenticación: cabecera `Authorization: Bearer <JWT>` salvo en `POST /api/auth/login`.

## REST — Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Cuerpo `{ "email", "password" }`. Respuesta `{ token, user }`. |

## REST — Dashboard

| Método | Ruta | Permiso |
|--------|------|---------|
| GET | `/api/dashboard/stats` | `dashboard.view` |

Respuesta: `{ activeCustomers, openOpportunities, closedWonDeals, closedWonRevenue }`.

## REST — Clientes

| Método | Ruta | Permiso |
|--------|------|---------|
| GET | `/api/customers` | `customers.read` |
| GET | `/api/customers/{id}` | `customers.read` |
| POST | `/api/customers` | `customers.write` |
| PUT | `/api/customers/{id}` | `customers.write` |

## REST — Prospectos (pipeline)

| Método | Ruta | Permiso |
|--------|------|---------|
| GET | `/api/prospects` | `prospects.read` |
| GET | `/api/prospects/{id}` | `prospects.read` |
| POST | `/api/prospects` | `prospects.write` |
| PUT | `/api/prospects/{id}` | `prospects.write` |

Etapas típicas: `LEAD`, `QUALIFIED`, `PROPOSAL`, `NEGOTIATION`, `WON`, `LOST`.

## REST — Campañas

| Método | Ruta | Permiso |
|--------|------|---------|
| GET | `/api/campaigns` | `campaigns.read` |
| GET | `/api/campaigns/{id}` | `campaigns.read` |
| GET | `/api/campaigns/{id}/metrics` | `campaigns.read` |
| GET | `/api/campaigns/{id}/effectiveness` | `campaigns.read` |
| POST | `/api/campaigns` | `campaigns.write` |
| PUT | `/api/campaigns/{id}` | `campaigns.write` |
| POST | `/api/campaigns/{id}/metrics` | `campaigns.write` |

## REST — Interacciones

| Método | Ruta | Permiso |
|--------|------|---------|
| GET | `/api/interactions/customer/{customerId}` | `interactions.read` |
| POST | `/api/interactions` | `interactions.write` |

## REST — Administración

| Método | Ruta | Permiso |
|--------|------|---------|
| GET | `/api/admin/users` | `users.manage` |
| GET | `/api/admin/users/{id}` | `users.manage` |
| POST | `/api/admin/users` | `users.manage` |
| PUT | `/api/admin/users/{id}` | `users.manage` |
| GET | `/api/admin/roles` | `users.manage` |

## REST — Reportes

| Método | Ruta | Permiso |
|--------|------|---------|
| GET | `/api/reports/dashboard.pdf` | `reports.export` |
| GET | `/api/reports/dashboard.xlsx` | `reports.export` |
| GET | `/api/reports/customers.xlsx` | `reports.export` |

## GraphQL

- Endpoint: `POST /graphql`
- Esquema en `backend/src/main/resources/graphql/schema.graphqls`.
- Consultas principales: `dashboardStats`, `customers`, `customer`, `prospects`, `campaigns`, `campaignEffectiveness`, `interactions`.
- Misma seguridad que REST (JWT); permisos por campo según la consulta invocada.

Interfaz GraphiQL (solo desarrollo): `/graphiql` cuando está habilitada en `application.yml`.

## Integración Supabase Auth

1. Crea usuarios en tu proyecto Supabase y enlázalos en la tabla `users` del CRM (`supabase_user_id` o mismo `email`).
2. Configura variables de entorno en el backend:
   - `SUPABASE_JWK_SET_URI` (JWKS del tenant), y opcionalmente `SUPABASE_JWT_ISSUER`.
3. El backend acepta JWT locales (login `/api/auth/login`) y, si está configurado JWKS, intenta validar también tokens Supabase después del fallo local.

## Actuator

- `GET /actuator/health` — público (salud del servicio).
