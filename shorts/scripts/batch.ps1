param(
  [string[]]$Langs = @("ko", "en", "ja")
)

$ErrorActionPreference = "Stop"

Get-ChildItem props -Filter *.json | ForEach-Object {
  $propsFile = $_.FullName
  $id = node -e "const fs=require('fs'); const props=JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); process.stdout.write(props.id);" $propsFile

  Write-Host "=== $id ==="
  npx remotion render SajuShort "output/$id.mp4" --props="$propsFile"
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }

  foreach ($lang in $Langs) {
    .\finalize.ps1 "output/$id.mp4" $propsFile $lang
    if ($LASTEXITCODE -ne 0) {
      exit $LASTEXITCODE
    }
  }
}

Write-Host "전체 완료"
