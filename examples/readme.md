# InterroBot Plugin Examples

## Running Plugins Locally

Firefox suppresses file:// referenced JavaScript loading, making even the most basic static dev without a server a problem. Likewise, InterroBot will not load a plugin from file://, it must be over http(s).

Easiest local static dev server for static content, IMO, is python core, which serves the current working directory (cwd) by default without a fuss. It is configured under server.py. But, please, use whatever you like. Any http server, with CORS correctly configured should do the trick.

```
$ cd ./interrobot-plugin/examples/
$ python server.py
serving at port http://127.0.0.1:8084 | Ctrl + Break (aka Pause) to end
```

If using a real server, you'll need to allow your page to be iframed, via CORS policy. These headers should be set on your plugin iframe pages alone, and not you're whole website. Remember that you'll need to allow the InterroBot desktop client running on a local IP address, and not the interro.bot domain. The allow statement should apply to * (any website).

Apache Server Example:

```
Header set X-Frame-Options "allow-from *"
```

InterroBot runs 

## Basic Example

A note of caution, the basic.html page is a blank if not loaded into InterroBot. You must first run interrobot, and load the plugin from within the app. From there, you get the URL arguments and access to the API necessary to do anything interesting. Developer tools are accessible from InterroBot itself, if you need them.