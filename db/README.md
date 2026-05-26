# Base de datos

El esquema y los datos semilla se cargan automáticamente con **Flyway** al iniciar el backend (`V1__init.sql`).

Para **Supabase**: crea un proyecto Postgres, configura `DATABASE_URL` (host del pooler o directo), usuario y contraseña, y ejecuta el backend para que Flyway aplique migraciones; o pega el contenido de `../backend/src/main/resources/db/migration/V1__init.sql` en el editor SQL si prefieres una carga manual única.
