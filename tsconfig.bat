@echo on
tsc -p .\tsconfig.json && ^
tsc -p .\tsconfig.commonjs.json && ^
tsc -p .\tsconfig.examples.json && ^
npx typedoc --entryPointStrategy expand --entryPoints "src/**/*.ts" --customCss ./docs-theme/interrobot-plugin.css