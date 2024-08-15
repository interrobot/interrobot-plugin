# InterroBot Plugin

This JavaScript library is used in the creation of plugins (aka reports) that present data or visualizations for a website in aggregate, across site content. Plugins run as an extension to the [InterroBot web crawler](https://interro.bot), available for Win10/11.

Connect to web analytics, LLM, or SAAS for extra insight. Keep your plugins to yourself, resell them to clients, or give them away to an adoring world... 

If you are looking to get started, check out the `./examples` Basic Example, [available on GitHub](https://github.com/interrobot/interrobot-plugin/tree/master/examples). It is a simple (100-ish lines) plugin recipe that can be taken in any direction.

## What data is available via API?

A bit of everything you need to get to brass tacks with a tricky development or SEO question. Throw in a DOMParser/XPath against the *content* field, and now you're cooking with gas. 

### HTML/DOCX/PDF

*content*: Page/file contents  
*headers*: HTTP headers  
*name*: Page/file name  
*norobots*: Crawler indexable  
*status*: HTTP status code  
*time*: Request time, in seconds  
*type*: Resource type, html, pdf, image, etc.

### HTML-only

*assets*: Array of assets (js/css/png/etc.)  
*links*: Array of outlinks

## Licensing

MPL 2.0, with exceptions. This repo contains two JavaScript to TypeScript ports, contained within `./src/lib`. As they arrived under existing licenses, they will remain under those.

* *Typo.js*: TypeScript port continues under the original [Modified BSD License](https://raw.githubusercontent.com/cfinke/Typo.js/master/license.txt).
* *Snowball.js*: TypeScript port continues under the original [MPL 1.1](https://raw.githubusercontent.com/fortnightlabs/snowball-js/master/LICENSE) license.
* *HTML To Markdown Text*: The Markdown library contains a modified version of an HTML to Markdown XSLT transformer by Michael Eichelsdoerfer [MIT](https://en.wikipedia.org/wiki/MIT_License) license.

The InterroBot plugins and the Typo.js TypeScript port make use of a handful of unmodified Hunspell dictionaries, as found in [wooorm's UTF-8 collection](https://github.com/wooorm/dictionaries/): [`dictionary-en`](https://github.com/wooorm/dictionaries/en), [`dictionary-en-gb`](https://github.com/wooorm/dictionaries/en-GB), [`dictionary-es`](https://github.com/wooorm/dictionaries/es),  [`dictionary-es-mx`](https://github.com/wooorm/dictionaries/es-MX), [`dictionary-fr`](https://github.com/wooorm/dictionaries/fr), and [`dictionary-ru`](https://github.com/wooorm/dictionaries/ru).
