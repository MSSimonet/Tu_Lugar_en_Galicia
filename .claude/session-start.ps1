# Hook SessionStart — Tu Lugar en Galicia
# Inyecta estado de docs/ y memoria al inicio de cada sesion de Claude Code.
# Claude lee este output como contexto y ejecuta consolidate-memory segun CLAUDE.md §9.

$root    = "C:\Users\ACER\Tu_Lugar_en_Galicia"
$memFile = "C:\Users\ACER\.claude\projects\C--Users-ACER-Tu-Lugar-en-Galicia\memory\MEMORY.md"

# Docs activos (excluye carpeta archivo/)
$docCount = (Get-ChildItem "$root\docs" -Filter "*.md" -File -Recurse |
    Where-Object { $_.FullName -notmatch "\\archivo\\" }).Count

# Fecha de ultima actualizacion de memoria
$lastMem = if (Test-Path $memFile) {
    (Get-Item $memFile).LastWriteTime.ToString("yyyy-MM-dd")
} else { "no existe" }

# Coherencia: docs referenciados en CLAUDE.md que deben existir
$required = @("roadmap.md","ARCHITECTURE.md","PRD-fase-1.md","design-system.md","gina-flujo.md","gina-barandas.md")
$missing  = $required | Where-Object { -not (Test-Path "$root\docs\$_") }
$coherence = if ($missing.Count -eq 0) { "OK" } else { "FALTA: $($missing -join ', ')" }

Write-Output "[inicio-sesion] docs/activos=$docCount | memoria=$lastMem | coherencia=$coherence | ACCION=consolidate-memory"
