# Configura JAVA_HOME (evita el shim Oracle javapath) y ejecuta tests.
# Uso: .\run-tests.ps1

$ErrorActionPreference = "Stop"

function Find-JdkHome {
    # NO usar javapath — es un enlace, no un JDK
    $searchRoots = @(
        "C:\Program Files\Java\jdk*",
        "C:\Program Files\Eclipse Adoptium\jdk*",
        "C:\Program Files\Microsoft\jdk*",
        "C:\Program Files\Amazon Corretto\jdk*"
    )

    $candidates = @()
    foreach ($pattern in $searchRoots) {
        $candidates += Get-ChildItem -Path $pattern -Directory -ErrorAction SilentlyContinue
    }

    # Preferir JDK 17+ (ordenar por nombre descendente ≈ versión más nueva)
    $valid = $candidates | Where-Object { Test-Path (Join-Path $_.FullName "bin\java.exe") } | Sort-Object Name -Descending

    if ($valid.Count -gt 0) {
        return $valid[0].FullName
    }

    # Intentar resolver destino real del shim javapath
    $shim = "C:\Program Files\Common Files\Oracle\Java\javapath\javac.exe"
    if (Test-Path $shim) {
        $item = Get-Item $shim -ErrorAction SilentlyContinue
        if ($item.Target) {
            $real = $item.Target | Select-Object -First 1
            if ($real -and (Test-Path $real)) {
                $home = Split-Path (Split-Path $real -Parent) -Parent
                if (Test-Path (Join-Path $home "bin\java.exe")) {
                    return $home
                }
            }
        }
    }

    return $null
}

Write-Host "Buscando JDK instalado..."
$jdk = Find-JdkHome

if (-not $jdk) {
    Write-Host ""
    Write-Host "No se encontro JDK. Instala uno con:" -ForegroundColor Yellow
    Write-Host "  winget install EclipseAdoptium.Temurin.17.JDK" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Luego cierra PowerShell, abre uno nuevo y ejecuta de nuevo .\run-tests.ps1"
    exit 1
}

$env:JAVA_HOME = $jdk
# Quitar javapath y JRE viejos del PATH en esta sesion
$cleanPath = ($env:Path -split ';' | Where-Object {
    $_ -and
    $_ -notmatch 'javapath' -and
    $_ -notmatch 'jre1\.8' -and
    $_ -notmatch '\\jre\\'
}) -join ';'
$env:Path = "$jdk\bin;$cleanPath"

Write-Host "JAVA_HOME = $env:JAVA_HOME"
Write-Host ""
java -version
Write-Host ""
mvn -version
Write-Host ""

Set-Location $PSScriptRoot
mvn clean test @args
