#!/bin/bash
FILE="/etc/nginx/conf.d/static.conf"
if [ -f "$FILE" ]; then
  echo "Removing stale Nginx config: $FILE"
  rm -f "$FILE"
fi

