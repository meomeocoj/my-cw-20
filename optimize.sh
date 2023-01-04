# !usr/bin/env bash
SOURCE=$(pwd)
OPTIMIZE_PATH="$(pwd)/optimize"
TARGET_PATH="$(pwd)/target/wasm32-unknown-unknown/release" 

# create wasm file
if [[ ! -d $TARGET_PATH ]]; then 
  (RUSTFLAGS='-C link-arg=-s' cargo wasm)
fi

#Create optimize folder 
if [[ ! -d $OPTIMIZE_PATH ]]; then 
  (mkdir -p $OPTIMIZE_PATH)
fi

target_wasm=$(ls -f $TARGET_PATH | grep .wasm)

for i in $target_wasm; do 
  (wasm-opt "$TARGET_PATH/$i" -Os -o "$OPTIMIZE_PATH/$i")
done


echo "pwd: `pwd`"
echo "SOURCE: $SOURCE" 
echo "OPTIMIZE_PATH: $OPTIMIZE_PATH"
echo "TARGET_PATH: $TARGET_PATH"
echo "target_wasm: $target_wasm"
