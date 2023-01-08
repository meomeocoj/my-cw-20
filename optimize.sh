# !usr/bin/env bash
SOURCE=$(pwd)
ARTIFACTS="$(pwd)/artifacts"
TARGET_PATH="$(pwd)/target/wasm32-unknown-unknown/release" 
MACHINE=$(uname -m)
SUFFIX=${MACHINE#x86_64}
SUFFIX=${SUFFIX:+-$SUFFIX}

echo "ARTIFACTS: $OPTIMIZE_PATH"
echo "TARGET_PATH: $TARGET_PATH"
# create wasm file
if [[ ! -d $TARGET_PATH ]]; then 
  (RUSTFLAGS='-C link-arg=-s' cargo wasm)
fi

#Create optimize folder 
if [[ ! -d $ARTIFACTS ]]; then 
  echo "Create folder artifacts"
  (mkdir -p $ARTIFACTS)
fi

target_wasm=$(ls -f $TARGET_PATH | grep .wasm)

for i in $target_wasm; do 
  echo "Optimizing $i..."
  NAME=$(basename "$i" .wasm)${SUFFIX}.wasm
  (wasm-opt "$TARGET_PATH/$i" -Os -o "$ARTIFACTS/$i")
done

