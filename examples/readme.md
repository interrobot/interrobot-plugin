# InterroBot Plugin Examples

## Setup

Plugin development relies on devtools to print messages to console and review/edit css. 

Windows users will need to use a debug version of InterroBot, available from a website account, at [interro.bot](https://interro.bot). The standard version has an issue where devtools will not open. This means a separate version is required for developing plugins, at the moment. This issue will hopefully resolve at some point when the upstream issue is addressed.

For macOS users, devtools can be accessed through Safari. Under Develop menu (enabled in Safari, Settings, Advanced, Show Develop menu in menu bar), then click the Show Web Inspector option. You may need to target InterroBot (also under the Develop menu).

## Running Plugins Locally

InterroBot will not load a plugin from file://, it must be over http(s).

Easiest local dev server for static content, IMO, is python core, which serves the current working directory (cwd) by default without a fuss. It is configured under server.py. But, please, use whatever you like. Any http server, with iframe headers correctly configured should do the trick.

```
$ cd ./interrobot-plugin/examples/
$ python server.py
serving at port http://127.0.0.1:8084 | Ctrl + Break (aka Pause) to end
```

If using a production server, you'll need to allow your page to be iframed. These headers should be set on your plugin iframe pages alone, and not your whole website. Remember that you'll need to allow the InterroBot desktop client running on a local IP address and locally available port, and not the interro.bot domain.

Your plugin HTML should include the following meta value, or HTTP header equivalent

`<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:">`

Allowing the interro.bot domain will do nothing productive, InterroBot client runs on localhost.

## Vanilla JS Example

A note of caution, the basic.html page is a blank if not loaded into InterroBot. You must first run InterroBot, and load the plugin from within the app. From there, you get the URL arguments and access to the API necessary to do anything interesting.


