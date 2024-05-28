# InterroBot Plugin Examples

## Running Plugins Locally

Firefox suppresses file:// referenced JavaScript loading, making even the most basic static dev without a server a problem. Likewise, InterroBot will not load a plugin from file://, it must be over http(s).

Easiest local dev server for static content, IMO, is python core, which serves the current working directory (cwd) by default without a fuss. It is configured under server.py. But, please, use whatever you like. Any http server, with iframe headers correctly configured should do the trick.

```
$ cd ./interrobot-plugin/examples/
$ python server.py
serving at port http://127.0.0.1:8084 | Ctrl + Break (aka Pause) to end
```

If using a production server, you'll need to allow your page to be iframed. These headers should be set on your plugin iframe pages alone, and not your whole website. Remember that you'll need to allow the InterroBot desktop client running on a local IP address and locally available port, and not the interro.bot domain.

There are two ways to accomplish this.

Your plugin HTML should include the following meta value, or HTTP header equivalent

`<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:">`

Allowing the interro.bot domain will do nothing productive, InterroBot client runs on localhost (https://0.0.0.0)

## Basic Example

A note of caution, the basic.html page is a blank if not loaded into InterroBot. You must first run InterroBot, and load the plugin from within the app. From there, you get the URL arguments and access to the API necessary to do anything interesting. Developer tools are accessible from InterroBot itself, if you need them.
