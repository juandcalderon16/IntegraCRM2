# Manual básico — Usuario final

## Inicio de sesión

Usa el correo y contraseña que te asigne el administrador. En entorno de demostración puedes probar cuentas como `vendedor@crm.local` / `password`.

## Dashboard

Muestra indicadores agregados: clientes activos, oportunidades abiertas, ventas ganadas e ingresos asociados a oportunidades en estado **WON**. Si tu rol tiene exportación, verás enlaces para PDF y Excel.

## Clientes (vendedor / asesor)

- **Lista de clientes**: consulta y creación (si tienes permiso de escritura).
- **Detalle del cliente**: historial de **interacciones** (llamadas, correos, reuniones, notas). Los asesores pueden registrar nuevas interacciones si tienen `interactions.write`.

## Pipeline comercial (vendedor)

La vista **Pipeline** agrupa oportunidades por etapa (`LEAD` → `LOST`). Puedes crear oportunidades y, con permiso de escritura, moverlas entre etapas con los botones de acción rápida.

## Campañas (analista)

- Visualiza campañas y pulsa **Efectividad** para ver CTR, tasa de conversión e ingresos atribuidos sumando todas las métricas registradas.
- Con permiso `campaigns.write`, puedes enviar un nuevo bloque de métricas para una campaña seleccionada.

## Permisos habituales por rol

| Rol | Uso típico |
|-----|------------|
| VENDEDOR | Clientes, prospectos, interacciones |
| ASESOR_SERVICIO | Lectura de clientes e historial; alta de interacciones |
| ANALISTA | Campañas y métricas |
| GERENTE | Dashboard y exportación de reportes |
| ADMIN | Todo lo anterior más gestión de usuarios |

Si falta una opción en el menú, tu cuenta no tiene el permiso necesario; contacta al administrador.

## Móvil

La interfaz usa TailwindCSS con rejillas responsivas: el menú lateral incluye un acceso compacto a **Menú** en pantallas pequeñas.
