#!/usr/bin/env bash
set -euo pipefail

LANGS="${LANGS:-ko en ja}"

for props_file in props/*.json; do
  id="$(
    node -e "const fs=require('fs'); const props=JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); process.stdout.write(props.id);" "$props_file"
  )"

  echo "=== ${id} ==="
  npx remotion render SajuShort "output/${id}.mp4" --props="$props_file"

  for lang in $LANGS; do
    ./finalize.sh "output/${id}.mp4" "$props_file" "$lang"
  done
done

echo "전체 완료"
