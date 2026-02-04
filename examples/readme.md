# InterroBot Plugin Examples

## Setup

Plugin development within InterroBot Desktop requires access to developer tools (devtools) for console output and CSS editing. The setup process differs slightly between Windows and macOS:

### Windows Users

Use F12 or open via the Dev Tools button in Options.

### Linux Users

Right click anywhere in the Window and select "Inspect."

### macOS Users

To access devtools through Safari, you'll need to enable the Develop menu.

* Open Safari Settings
* Go to Advanced
* Check "Show Develop menu in menu bar"
* From the Develop menu, select "Show Web Inspector"
* You may need to specifically target InterroBot (also found under the Develop menu)

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

From an InterroBot project (in app), go to the reports page within a project. Under 3rd Party Reports, with the server running on loopback, add the following URL: http://127.0.0.1:8084/vanillajs/basic.html

A note of caution, the basic.html page is a blank if not loaded into InterroBot.


