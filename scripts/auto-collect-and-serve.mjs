import { createServer } from "node:http";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 4173);
const intervalMinutes = Number(process.env.COLLECT_INTERVAL_MINUTES || 60);
const updateScript = path.join(root, "scripts", "update-tourism-data.mjs");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8"
};

let collectPromise = null;
let lastCollectStatus = {
  running: false,
  lastStartedAt: null,
  lastFinishedAt: null,
  ok: null,
  message: "Not started"
};

const runCollect = () => {
  if (collectPromise) return collectPromise;

  lastCollectStatus = {
    ...lastCollectStatus,
    running: true,
    lastStartedAt: new Date().toISOString(),
    message: "Collecting"
  };

  collectPromise = new Promise((resolve) => {
    const child = spawn(process.execPath, [updateScript], {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let output = "";

    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
      process.stdout.write(chunk);
    });
    child.stderr.on("data", (chunk) => {
      output += chunk.toString();
      process.stderr.write(chunk);
    });
    child.on("close", (code) => {
      lastCollectStatus = {
        running: false,
        lastStartedAt: lastCollectStatus.lastStartedAt,
        lastFinishedAt: new Date().toISOString(),
        ok: code === 0,
        message: code === 0 ? "Collected successfully" : `Collector exited with code ${code}`,
        output: output.trim().slice(-2000)
      };
      collectPromise = null;
      resolve(lastCollectStatus);
    });
  });

  return collectPromise;
};

const safeFilePath = (requestUrl) => {
  const url = new URL(requestUrl, `http://localhost:${port}`);
  const pathname = decodeURIComponent(url.pathname);
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const resolved = path.resolve(root, relative);

  if (!resolved.startsWith(root)) return null;
  return resolved;
};

const serveFile = async (request, response) => {
  const filePath = safeFilePath(request.url);
  if (!filePath) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    response.writeHead(200, {
      "content-type": contentTypes[path.extname(filePath)] || "application/octet-stream",
      "cache-control": "no-store"
    });
    response.end(file);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
};

const server = createServer(async (request, response) => {
  if (request.url === "/__collect-status") {
    response.writeHead(200, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    });
    response.end(JSON.stringify(lastCollectStatus));
    return;
  }

  if (request.url === "/__collect-now") {
    const status = await runCollect();
    response.writeHead(status.ok ? 200 : 500, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    });
    response.end(JSON.stringify(status));
    return;
  }

  await serveFile(request, response);
});

server.listen(port, async () => {
  console.log(`Serving http://localhost:${port}`);
  console.log(`Collecting immediately, then every ${intervalMinutes} minutes.`);
  await runCollect();
  setInterval(runCollect, intervalMinutes * 60 * 1000);
});
