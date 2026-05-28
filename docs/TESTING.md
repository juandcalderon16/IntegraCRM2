# Pruebas unitarias y SonarQube

## Ejecutar tests localmente

```powershell
cd backend
.\run-tests.ps1
```

O manualmente (si `mvn test` falla con "No compiler is provided"):

```powershell
# Detectar JDK desde javac y fijar JAVA_HOME
$env:JAVA_HOME = Split-Path (Split-Path (Get-Command javac).Source -Parent) -Parent
mvn -version   # debe mostrar JDK, no solo JRE
mvn clean test
```

```bash
cd backend
mvn clean test
```

El reporte de cobertura JaCoCo se genera en:

- HTML: `target/site/jacoco/index.html`
- XML (para Sonar): `target/site/jacoco/jacoco.xml`

## Análisis con SonarQube / SonarCloud

Desde la carpeta `backend/` (con SonarScanner instalado):

```bash
mvn clean verify sonar:sonar \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.token=TU_TOKEN
```

O usando el archivo `sonar-project.properties` incluido:

```bash
cd backend
mvn clean test
sonar-scanner
```

## Suites incluidas

| Clase de test | Cubre |
|---------------|--------|
| `DashboardServiceTest` | KPIs del dashboard |
| `CampaignServiceTest` | Efectividad, CRUD campañas, métricas |
| `CustomerServiceTest` | Listado y alta de clientes |
| `ProspectServiceTest` | Pipeline comercial |
| `UserAdminServiceTest` | Alta de usuarios y roles |
| `AuthServiceTest` | Login JWT |
| `JwtServiceTest` | Creación/parsing de tokens |
| `CrmUserDetailsTest` | Permisos por rol |
| `ReportExportServiceTest` | Export PDF/Excel |
| `GlobalExceptionHandlerTest` | Manejo de errores REST |
| `GraphQlTypesTest` | Mapeo GraphQL ↔ API |

Las pruebas usan **JUnit 5 + Mockito** (sin levantar Spring ni base de datos), ideales para CI y cobertura en Sonar.
