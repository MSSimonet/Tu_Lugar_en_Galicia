# pre-compact.ps1
# Snapshot mecanico del estado del repo en docs/arranque.md antes de compactar.
# Sin bloqueos. Sin marcadores. exit 0 siempre.
#
# Nota: chars especiales construidos desde code points para evitar corrupcion
# de encoding en PowerShell 5.1 (lee .ps1 como Windows-1252, no UTF-8).
$ErrorActionPreference = 'SilentlyContinue'

$root = Split-Path $PSScriptRoot -Parent
$file = Join-Path $root 'docs\arranque.md'

if (-not (Test-Path $file)) { exit 0 }

# Chars especiales por code point (evita literales no-ASCII en el fuente)
$eAc  = [char]0xE9    # e
$uAc  = [char]0xDA    # U
$dash = [char]0x2014  # em dash

$ts       = Get-Date -Format 'yyyy-MM-dd HH:mm'
$log10    = (git -C $root log --oneline -10 2>$null) -join "`n"
$dirty    = (git -C $root status --short 2>$null) -join "`n"
$unpushed = (git -C $root log --oneline 'origin/main..HEAD' 2>$null) -join "`n"

if (-not $log10)    { $log10    = '(sin commits)' }
if (-not $dirty)    { $dirty    = 'working tree limpio' }
if (-not $unpushed) { $unpushed = "(ninguno ${dash} origin/main al dia)" }

$f = '```'

$block = @"

## Estado t${eAc}cnico al cierre

> Actualizado por pre-compact hook ${dash} $ts

### ${uAc}ltimos 10 commits

$f
$log10
$f

### Working tree

$f
$dirty
$f

### Pendientes de push (origin/main..HEAD)

$f
$unpushed
$f
"@

$utf8 = [System.Text.UTF8Encoding]::new($false)  # UTF-8 sin BOM
$raw  = [System.IO.File]::ReadAllText($file, $utf8)

# Quitar seccion anterior si existe (siempre al final del archivo)
$marker = "`n## Estado t${eAc}cnico al cierre"
if ($raw.Contains($marker)) {
    $idx = $raw.IndexOf($marker)
    $raw = $raw.Substring(0, $idx)
}

$raw = $raw.TrimEnd() + $block

[System.IO.File]::WriteAllText($file, $raw, $utf8)

exit 0
