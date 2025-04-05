#!/bin/bash

echo "[HOOK] Running predeploy cleanup..."

FILES_TO_REMOVE=(
  "/etc/nginx/conf.d/static.conf"
  "/etc/nginx/conf.d/staticfiles.conf"
)

for FILE in "${FILES_TO_REMOVE[@]}"
do
  if [ -f "$FILE" ]; then
    echo "[HOOK] Removing stale file: $FILE"
    rm -f "$FILE"
  fi
done

