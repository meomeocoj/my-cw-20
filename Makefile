all: optimize schema codegen

optimize: 
	./optimize.sh
schema:
	./schema.sh
codegen: ./contract/**/schema
	ts-node codegen/codegen.ts 
clean:
	rm -rf ./contract/**/schema ./codegen/contract target artifacts
.PHONY: optimize schema clean codegen
