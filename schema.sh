# !usr/bin/env bash
SOURCE=$(pwd)

for f in ./contract/*
do
  echo "generating schema for ${f##*/}"
  cd $f
  CMD="cargo schema"
  eval $CMD &> /dev/null
  cd $SOURCE
done  
