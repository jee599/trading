param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$Video,

  [Parameter(Mandatory = $true, Position = 1)]
  [string]$Props,

  [Parameter(Position = 2)]
  [string]$Lang = "ko"
)

$ErrorActionPreference = "Stop"

if ($env:PYTHON_BIN) {
  $pythonBin = $env:PYTHON_BIN
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
  $pythonBin = "python"
} else {
  $pythonBin = "python3"
}

if ($env:FFMPEG_BIN) {
  $ffmpegBin = $env:FFMPEG_BIN
} elseif (Get-Command ffmpeg -ErrorAction SilentlyContinue) {
  $ffmpegBin = "ffmpeg"
} else {
  $ffmpegBin = node -e "const value=require('ffmpeg-static'); if (value) process.stdout.write(value);"
}

if (-not $ffmpegBin) {
  throw "ffmpeg binary not found. Install ffmpeg or add ffmpeg-static."
}

$id = node -e "const fs=require('fs'); const props=JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); process.stdout.write(props.id);" $Props
$audio = "output/audio/${id}_${Lang}.mp3"
$subs = "output/subs/${id}_${Lang}.ass"
$final = "output/final/${id}_${Lang}.mp4"
$bgm = if ($env:BGM_PATH) { $env:BGM_PATH } else { "public/bgm/default.mp3" }

New-Item -ItemType Directory -Force output/audio, output/subs, output/final | Out-Null

Write-Host "[1/3] TTS 생성"
& $pythonBin scripts/tts.py $Props $Lang $audio
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Write-Host "[2/3] 자막 생성"
& $pythonBin scripts/subtitles.py $audio $Props $Lang $subs
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Write-Host "[3/3] 최종 합성"
$subsFilter = $subs -replace "\\", "/"
if (Test-Path $bgm) {
  & $ffmpegBin -y `
    -i $Video `
    -i $audio `
    -stream_loop -1 `
    -i $bgm `
    -filter_complex "[1:a]volume=1.0[voice];[2:a]volume=0.18[bgm];[voice][bgm]amix=inputs=2:duration=first[aout]" `
    -map 0:v `
    -map "[aout]" `
    -vf "ass=$subsFilter" `
    -c:v libx264 `
    -pix_fmt yuv420p `
    -c:a aac `
    -shortest `
    $final
} else {
  & $ffmpegBin -y `
    -i $Video `
    -i $audio `
    -filter_complex "[1:a]volume=1.0[aout]" `
    -map 0:v `
    -map "[aout]" `
    -vf "ass=$subsFilter" `
    -c:v libx264 `
    -pix_fmt yuv420p `
    -c:a aac `
    -shortest `
    $final
}

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

Write-Host "완료 -> $final"
