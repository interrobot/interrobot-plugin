# InterroBot Plugin

This JavaScript library is used in the creation of plugins (aka reports) that present data or visualizations for a website in aggregate, across site content. Plugins run as an extension to the [InterroBot](https://interro.bot) web crawler, available for Win10/11.

InterroBot sets a sort of aesthetic standard with the core plugins, but there are no rules. Throw off the CSS if it makes you happy. Connect to web analytics, LLM, or SAAS for extra insight. Keep your plugins to yourself, resell them to clients, or give them away to an adoring world... 

If you are looking to get started, check out the `./examples` Basic Example. It is a simple (100-ish lines) plugin recipe that can be taken in any direction.

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
