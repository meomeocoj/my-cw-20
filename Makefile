curDir:=$(shell pwd)
baseName := $(notdir $(curDir))_cache
BUILDARCH := $(shell uname -m)

all: optimize schema codegen

optimize-arm64:
	docker run --rm -v $(curDir):/code \
	--mount type=volume,source=$(baseName),target=/code/contracts/burner/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/workspace-optimizer-arm64:0.12.11

optimize-x86_64:
	docker run --rm -v $(curDir):/code \
	--mount type=volume,source=$(baseName),target=/code/contracts/burner/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/workspace-optimizer:0.12.11

optimize: optimize-$(BUILDARCH) 
	
schema:
	./schema.sh
codegen: ./contract/**/schema
	ts-node codegen/codegen.ts 
clean:
	rm -rf ./contract/**/schema target artifacts

.PHONY: optimize schema clean codegen
