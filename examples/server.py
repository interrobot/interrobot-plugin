import http.server
import socketserver

PORT = 8084
HOST = "127.0.0.1"

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

NoCacheHTTPRequestHandler.extensions_map[".js"] = "text/javascript"
NoCacheHTTPRequestHandler.extensions_map[".css"] = "text/css"
NoCacheHTTPRequestHandler.extensions_map[".woff2"] = "application/font-woff2"

with socketserver.TCPServer((HOST, PORT), NoCacheHTTPRequestHandler) as httpd:
    print("serving at port http://{0}:{1} | Ctrl + Break (aka Pause) to end".format(HOST, PORT))
    httpd.serve_forever()