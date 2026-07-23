import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distClientDir = path.join(rootDir, "dist", "client");
const outDir = path.join(rootDir, "out");
const BASE = (process.env.BASE_PATH || "/aip-c01-revision-console").replace(/\/$/, "");

await fs.rm(outDir, { recursive: true, force: true });
await fs.cp(distClientDir, outDir, { recursive: true });

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
const { default: worker } = await import(workerUrl.href);

function fixHtmlBase(html) {
  let result = html;
  result = result.replaceAll('href="/assets/', `href="${BASE}/assets/`);
  result = result.replaceAll('src="/assets/', `src="${BASE}/assets/`);
  result = result.replaceAll('import("/assets/', `import("${BASE}/assets/`);
  result = result.replaceAll('href="/favicon.svg"', `href="${BASE}/favicon.svg"`);
  result = result.replaceAll('content="/aip-c01-social-card.png"', `content="${BASE}/aip-c01-social-card.png"`);
  result = result.replaceAll('href="/data/', `href="${BASE}/data/`);
  result = result.replaceAll('"/assets/', `"${BASE}/assets/`);
  return result;
}

async function renderPage(pathname) {
  const req = new Request(`http://localhost${pathname}`, {
    headers: { accept: "text/html" },
  });
  const env = {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  };
  const ctx = { waitUntil() {}, passThroughOnException() {} };
  const res = await worker.fetch(req, env, ctx);
  if (res.status !== 200) {
    throw new Error(`Failed to render ${pathname}: status ${res.status}`);
  }
  const rawHtml = await res.text();
  return fixHtmlBase(rawHtml);
}

async function writeHtml(pathname, html) {
  const relPath = pathname === "/" ? "index.html" : path.join(pathname.slice(1), "index.html");
  const filePath = path.join(outDir, relPath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, html, "utf8");
}

console.log("Pre-rendering pages for static export with base prefix:", BASE);

const homeHtml = await renderPage("/");
await writeHtml("/", homeHtml);

const servicesHtml = await renderPage("/services");
await writeHtml("/services", servicesHtml);

const servicesDataRaw = await fs.readFile(path.join(rootDir, "public", "data", "services.json"), "utf8");
const servicesData = JSON.parse(servicesDataRaw);

let count = 0;
for (const service of servicesData.items) {
  const pathname = `/services/${service.id}`;
  try {
    const html = await renderPage(pathname);
    await writeHtml(pathname, html);
    count++;
  } catch (err) {
    console.warn(`Warning: failed to render ${pathname}:`, err.message);
  }
}

console.log(`Static export completed: pre-rendered / , /services , and ${count} service detail pages to ./out`);
