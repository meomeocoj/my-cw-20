# !usr/bin/env bash
SOURCE=$(pwd)

for f in ./contracts/*
do
  echo "generating schema for ${f##*/}"
  cd $f
  CMD="cargo schema"
  eval $CMD &> /dev/null
  cd $SOURCE
done  
