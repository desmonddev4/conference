const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const routes = {
  "/": "pages/dashboard.html",
  "/login": "pages/login.html",
  "/register": "pages/register.html",
  "/attendees": "pages/attendees.html",
  "/revenue": "pages/revenue.html",
  "/admin/dashboard": "pages/admin/dashboard.html",
  "/admin/team": "pages/admin/team.html",
  "/admin/logs": "pages/admin/logs.html",
};
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
};

http.createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }

  const route = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  const relativePath = routes[route] || route.replace(/^\/+/, "");
  const filePath = path.resolve(root, relativePath);
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, contents) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
      return;
    }
    response.writeHead(200, { "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream" });
    response.end(contents);
  });
}).listen(port, "127.0.0.1", () => {
  console.log(`NST Register frontend ready at http://localhost:${port}`);
});
