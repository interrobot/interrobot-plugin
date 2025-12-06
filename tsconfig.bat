@echo on
tsc -p ./tsconfig.json && ^
tsc -p ./tsconfig.commonjs.json && ^
tsc -p ./tsconfig.examples.json && ^
esbuild examples\vanillats\js\build\examples\vanillats\ts\hypertree.js --bundle --outfile=examples\vanillats\js\hypertree.js && ^
esbuild examples\vanillats\js\build\examples\vanillats\ts\wordcloud.js --bundle --outfile=examples\vanillats\js\wordcloud.js && ^
esbuild examples\vanillats\js\build\examples\vanillats\ts\interrobot-plugin.js --bundle --outfile=examples\vanillats\js\interrobot-plugin.js && ^
esbuild examples\vanillats\js\build\examples\vanillats\ts\hypertree.js --bundle --minify --outfile=examples\vanillats\js\hypertree.min.js && ^
esbuild examples\vanillats\js\build\examples\vanillats\ts\wordcloud.js --bundle --minify --outfile=examples\vanillats\js\wordcloud.min.js && ^
esbuild examples\vanillats\js\build\examples\vanillats\ts\interrobot-plugin.js --bundle --minify --outfile=examples\vanillats\js\interrobot-plugin.min.js && ^
copy examples\vanillats\js\interrobot-plugin.js examples\vanillajs\interrobot-plugin.js && ^
copy examples\vanillats\js\interrobot-plugin.min.js examples\vanillajs\interrobot-plugin.min.js && ^
npx typedoc --entryPointStrategy expand --entryPoints "src/**/*.ts" --customCss ./docs-theme/interrobot-plugin.css