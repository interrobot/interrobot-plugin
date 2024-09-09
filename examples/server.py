# `python server.py` because mime support above and beyond (default)
# `python -m http.server -b 127.0.0.1 8084`
# don't think you need to use this server, any http server will work
# just make sure X-Frame-Options is "*" on iframe plugin page or CORS
# error will result.

import http.server
import socketserver

PORT = 8084
HOST = "127.0.0.1"

Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map[".js"] = "text/javascript"
Handler.extensions_map[".css"] = "text/css"
Handler.extensions_map[".woff2"] = "application/font-woff2"
with socketserver.TCPServer((HOST, PORT), Handler) as httpd:
    print("serving at port http://{0}:{1} | Ctrl + Break (aka Pause) to end".format(HOST, PORT))
    httpd.serve_forever()
