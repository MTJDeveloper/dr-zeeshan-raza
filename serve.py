"""
Local dev server for the Dr. Zeeshan Raza site.

Adds a /upload endpoint so the doctor's 3 photos can be saved
straight from the browser without manual right-click-save.

Run:
    python serve.py

Then open: http://localhost:8080/upload.html
"""
import http.server
import socketserver
import os
import json
import base64

PORT = 8080
ROOT = os.path.dirname(os.path.abspath(__file__))
IMAGES_DIR = os.path.join(ROOT, "assets", "images")

ALLOWED = {
    "doctor-hero.png",
    "doctor-about.png",
    "doctor-portrait.png",
}


class Handler(http.server.SimpleHTTPRequestHandler):

    def do_POST(self):
        if self.path != "/upload":
            self.send_error(404, "Not found")
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 30 * 1024 * 1024:  # 30 MB cap
                self.send_error(413, "Payload too large")
                return

            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            filename = payload.get("filename", "")
            data_b64 = payload.get("data", "")

            if filename not in ALLOWED:
                self.send_error(400, f"Filename not allowed: {filename}")
                return
            if not data_b64:
                self.send_error(400, "Missing data")
                return

            os.makedirs(IMAGES_DIR, exist_ok=True)
            content = base64.b64decode(data_b64)
            target = os.path.join(IMAGES_DIR, filename)
            with open(target, "wb") as f:
                f.write(content)

            body = json.dumps({
                "ok": True,
                "filename": filename,
                "bytes": len(content),
                "path": os.path.relpath(target, ROOT).replace("\\", "/"),
            }).encode("utf-8")

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        except Exception as ex:  # noqa: BLE001 — local dev tool
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"ok": False, "error": str(ex)}).encode("utf-8"))

    def log_message(self, fmt, *args):
        # Quieter log
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))


def main():
    os.chdir(ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving {ROOT} at http://localhost:{PORT}")
        print(f"Upload page: http://localhost:{PORT}/upload.html")
        httpd.serve_forever()


if __name__ == "__main__":
    main()
