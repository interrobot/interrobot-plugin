# InterroBot Plugin

This TypeScript/JavaScript library is used in the creation of plugins (aka reports) that extract data from, or visualize a website in aggregate, across pages. Plugins run as an extention to the [InterroBot](https://interro.bot) web crawler, available for Win10/11.

InterroBot sets a sort of aesthetic standard with the core plugins, but there are no rules. Throw off the CSS if it makes you happy. Connect to web analytics, LLM, or SAAS for extra insight. Resell your plugins or give them away to an adoring world. If you are looking to get started, check out the `./examples` Basic Example. It is a simple (100-ish lines) plugin recipe that can be taken in any direction.

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

## Getting Started



## Licencing

Except where otherwise stated, MPL 2.0. See license.txt.

This repo contains two JavaScript to TypeScript ports, contained in `./src/lib`. As they arrived under existing licences, they will remain under those.

*Typo.js*: TypeScript port will continue licensing under original [Modified BSD License](https://raw.githubusercontent.com/cfinke/Typo.js/master/license.txt) license.

*Snowball.js*: TypeScript port will continue licensing under original [MPL 1.1](https://raw.githubusercontent.com/fortnightlabs/snowball-js/master/LICENSE) license.
