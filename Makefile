optimize:
	./optimize.sh
schema:
	./schema.sh
clean:
	rm -rf ./contract/**/schema target artifacts 
.PHONY: optimize schema clean
