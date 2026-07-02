# pre-compact.ps1 — Guard de calidad para compactación de contexto.
#
# Flujo:
#   1ª vez en sesión (sin marcador) → exit 2, bloquea, da instrucciones a Claude.
#   2ª vez (marcador existe)        → actualización mecánica git + exit 0.
#
# El marcador .precompact-done se borra en SessionStart (ver settings.json).
$ErrorActionPreference = 'SilentlyContinue'

$root   = Split-Path $PSScriptRoot -Parent
$marker = Join-Path $PSScriptRoot '.precompact-done'

if (-not (Test-Path $marker)) {
    [Console]::Error.WriteLine(@'
BLOQUEO PRE-COMPACTACION — docs/arranque.md necesita actualizacion manual.

Antes de compactar, reescribi estas secciones con el estado real de esta sesion:

  §2 — Verificado esta sesion: cada fix con commit y evidencia concreta.
  §4 — Pendientes de Silvana: lista consolidada y actual.
  §5 — Pendientes tecnicos: lo que quedo sin resolver.
  §6 — Cambios de configuracion: lo que cambio en esta sesion.

Cuando lo tengas listo:
  1. Guarda docs/arranque.md.
  2. Crea el marcador con este comando exacto:
       New-Item -ItemType File 'C:\Users\ACER\Tu_Lugar_en_Galicia\.claude\.precompact-done'
  3. Vuelve a intentar la compactacion (/compact o deja que se dispare sola).
'@)
    exit 2
}

# Marcador existe — actualizacion mecanica de git y exit 0.
$file = Join-Path $root 'docs\arranque.md'

$today    = Get-Date -Format 'yyyy-MM-dd'
$logLines = git -C $root log --oneline -10 2>$null
$dirty    = git -C $root status --short 2>$null

$raw = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

# Actualizar fecha en el header
$raw = $raw -replace '> Actualizado \d{4}-\d{2}-\d{2}[^.]*\.', "> Actualizado $today."

# Construir nuevo bloque de commits
$fence     = '```'
$logText   = $logLines -join "`n"
$dirtyNote = if ($dirty) {
    "`n`n⚠️ Cambios sin commitear al compactar:`n" +
    (($dirty | ForEach-Object { "  $_" }) -join "`n") + "`n"
} else { "`n" }
$newBlock = "### Commits en origin/main (actualizado $today)`n`n$fence`n$logText`n$fence$dirtyNote"

# Reemplazar seccion de commits: desde ### Commits hasta justo antes de \n---\n
$raw = $raw -replace '(?s)### Commits[^\n]*\n.*?(?=\n---\n)', $newBlock

[System.IO.File]::WriteAllText($file, $raw, [System.Text.Encoding]::UTF8)

Write-Output ''
Write-Output '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
Write-Output 'Contexto por compactar — docs/arranque.md actualizado.'
Write-Output 'Copia su contenido y abri una sesion nueva para continuar'
Write-Output 'sin perdida de precision.'
Write-Output '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
exit 0
