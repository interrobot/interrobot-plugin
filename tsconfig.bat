@echo on
tsc -p .\tsconfig.json && ^
tsc -p .\tsconfig.commonjs.json && ^
npx typedoc --entryPointStrategy expand --entryPoints "src/**/*.ts" --customCss ./docs-theme/interrobot-plugin.css