import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDirectory = path.resolve(__dirname, "..", "public");
const chessLibraryPath = path.resolve(
  __dirname,
  "..",
  "node_modules",
  "chess.js",
  "dist",
  "esm",
  "chess.js"
);

export function createServer() {
  return http.createServer((request, response) => {
    const requestUrl = new URL(request.url, "http://localhost");

    if (requestUrl.pathname === "/health") {
      response.writeHead(200, {
        "content-type": "application/json; charset=utf-8"
      });

      response.end(JSON.stringify({ status: "ok" }));
      return;
    }

    const requestedPath = requestUrl.pathname === "/"
      ? "index.html"
      : requestUrl.pathname.slice(1);
    const filePath = path.resolve(publicDirectory, requestedPath);

    if (filePath.startsWith(`${publicDirectory}${path.sep}`) && fs.existsSync(filePath)) {
      const contentTypes = {
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".svg": "image/svg+xml"
      };

      response.writeHead(200, {
        "content-type": contentTypes[path.extname(filePath)] ?? "application/octet-stream"
      });
      fs.createReadStream(filePath).pipe(response);
      return;
    }

    if (requestUrl.pathname === "/vendor/chess.js" && fs.existsSync(chessLibraryPath)) {
      response.writeHead(200, {
        "content-type": "text/javascript; charset=utf-8",
        "cache-control": "no-cache"
      });
      fs.createReadStream(chessLibraryPath).pipe(response);
      return;
    }

    response.writeHead(404, {
      "content-type": "application/json; charset=utf-8"
    });

    response.end(JSON.stringify({ error: "not_found" }));
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 3000);

  createServer().listen(port, "127.0.0.1", () => {
    console.log(
      `Chess Opening Coach listening at http://127.0.0.1:${port}`
    );
  });
}
