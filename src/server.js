import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDirectory = path.resolve(__dirname, "..", "public");

export function createServer() {
  return http.createServer((request, response) => {
    if (request.url === "/health") {
      response.writeHead(200, {
        "content-type": "application/json; charset=utf-8"
      });

      response.end(JSON.stringify({ status: "ok" }));
      return;
    }

    if (request.url === "/" || request.url === "/index.html") {
      const html = fs.readFileSync(
        path.join(publicDirectory, "index.html"),
        "utf8"
      );

      response.writeHead(200, {
        "content-type": "text/html; charset=utf-8"
      });

      response.end(html);
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
