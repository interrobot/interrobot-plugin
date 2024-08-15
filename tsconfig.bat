@echo on
tsc -p .\tsconfig.json && ^
tsc -p .\tsconfig.commonjs.json && ^
tsc -p .\tsconfig.examples.json
