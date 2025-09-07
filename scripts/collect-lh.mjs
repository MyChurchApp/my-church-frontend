import { readdirSync, readFileSync, writeFileSync } from "fs";

const files = readdirSync(".").filter(f => f.startsWith("lh-") && f.endsWith(".json"));

const rows = files.map(file => {
  const j = JSON.parse(readFileSync(file, "utf8"));
  const get = (id, key="numericValue") => j.audits?.[id]?.[key] ?? null;

  return {
    page: file.replace(/^lh-/, "").replace(/\.json$/, ""),
    performance: (j.categories?.performance?.score ?? 0) * 100,
    accessibility: (j.categories?.accessibility?.score ?? 0) * 100,
    bestPractices: (j.categories?.["best-practices"]?.score ?? 0) * 100,
    seo: (j.categories?.seo?.score ?? 0) * 100,
    pwa: j.categories?.pwa?.score != null ? j.categories.pwa.score * 100 : null,

    // Métricas principais:
    lcp_ms: get("largest-contentful-paint"),
    inp_ms: get("interaction-to-next-paint"),   // INP correto
    cls: get("cumulative-layout-shift"),
    ttfb_ms: get("server-response-time"),
  };
});

writeFileSync("lh-summary.json", JSON.stringify(rows, null, 2));

// CSV opcional
const hdr = Object.keys(rows[0] || {}).join(",");
const csv = [hdr, ...rows.map(r => Object.values(r).join(","))].join("\n");
writeFileSync("lh-summary.csv", csv);

console.table(rows);
console.log("✅ Gerados: lh-summary.json e lh-summary.csv");
