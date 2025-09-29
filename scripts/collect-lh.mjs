import { readdirSync, readFileSync, writeFileSync } from "fs";

const files = readdirSync(".")
  .filter(f => /^lh-(?!summary)(.+)\.json$/.test(f)); // ignora lh-summary.json

const rows = [];
for (const file of files) {
  const j = JSON.parse(readFileSync(file, "utf8"));
  const perfScore = j.categories?.performance?.score;

  // pula arquivos inválidos (sem score)
  if (typeof perfScore !== "number") {
    console.warn(`⚠️ ignorado ${file}: sem categories.performance.score`);
    continue;
  }

  const get = (id, key="numericValue") => j.audits?.[id]?.[key] ?? null;

  rows.push({
    page: file.replace(/^lh-/, "").replace(/\.json$/, ""),
    performance: Math.round(perfScore * 100),
    accessibility: j.categories?.accessibility?.score != null ? Math.round(j.categories.accessibility.score * 100) : null,
    bestPractices: j.categories?.["best-practices"]?.score != null ? Math.round(j.categories["best-practices"].score * 100) : null,
    seo: j.categories?.seo?.score != null ? Math.round(j.categories.seo.score * 100) : null,
    pwa: j.categories?.pwa?.score != null ? Math.round(j.categories.pwa.score * 100) : null,
    lcp_ms: get("largest-contentful-paint"),
    inp_ms: get("interaction-to-next-paint"),
    cls: get("cumulative-layout-shift"),
    ttfb_ms: get("server-response-time"),
  });
}

writeFileSync("lh-summary.json", JSON.stringify(rows, null, 2));
console.table(rows);
console.log("✅ Gerados: lh-summary.json");
