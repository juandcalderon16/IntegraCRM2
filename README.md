# CRM modular

Sistema **CRM** con arquitectura por capas (backend Java), **PostgreSQL** (compatible con **Supabase**), frontend **React + Vite + Tailwind**, APIs **REST** y **GraphQL**, autenticación **JWT** con roles y permisos, e integración opcional con **Supabase Auth** (JWKS). Exportación **PDF** y **Excel**.

## Estructura

- `backend/` — Spring Boot 3.2, Java 17, Flyway, GraphQL, informes.
- `frontend/` — SPA responsiva, proxy de desarrollo hacia el backend.
- `db/` — notas y scripts auxiliares (el esquema principal está en Flyway).
- `docker/` — Docker Compose (Postgres + backend + frontend).
- `docs/` — API, modelo de datos, manuales.

## Arranque rápido con Docker

Desde la carpeta del proyecto:

```bash
cd docker
docker compose up --build
```

- Interfaz web: [http://localhost:8081](http://localhost:8081)
- API directa: [http://localhost:8080](http://localhost:8080)

Credenciales demo (contraseña `password`):

- Administrador: `admin@crm.local`
- Vendedor: `vendedor@crm.local`
- Analista: `analista@crm.local`
- Asesor: `asesor@crm.local`
- Gerente: `gerente@crm.local`

## Desarrollo local (sin Docker)

1. **PostgreSQL**: crea base `crm`, usuario/contraseña alineados con `application.yml` o variables de entorno (véase `.env.example`).
2. **Backend**: `cd backend && mvn spring-boot:run`
3. **Frontend**: `cd frontend && npm install && npm run dev` — API en `8080`, UI en `5173` con proxy a `/api` y `/graphql`.

## Variables de entorno

Copia `.env.example` y ajusta. Para producción con Supabase, define la URL JDBC del proyecto y, si usas Auth de Supabase, `SUPABASE_JWK_SET_URI` / `SUPABASE_JWT_ISSUER`.

## Documentación

- [API REST y GraphQL](docs/API.md)
- [Modelo de datos](docs/DATA_MODEL.md)
- [Manual administrador](docs/MANUAL_ADMIN.md)
- [Manual usuario](docs/MANUAL_USUARIO.md)
