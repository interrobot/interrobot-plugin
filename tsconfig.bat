@echo on
cd /d "%~dp0"
rem wipe generated output, stale files from removed sources linger otherwise
if exist dist rmdir /s /q dist
if exist examples\vanillats\js\build rmdir /s /q examples\vanillats\js\build
mkdir dist
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
copy package.json dist && ^
python -c "import re,pathlib; p=pathlib.Path('README.md'); pathlib.Path('dist/README.md').write_text(re.sub(r'<p.*?</p>', '', p.read_text(encoding='utf-8'), count=2, flags=re.DOTALL|re.IGNORECASE).strip(), encoding='utf-8')" && ^
npx typedoc --entryPointStrategy expand --entryPoints "src/**/*.ts" --customCss ./docs.css