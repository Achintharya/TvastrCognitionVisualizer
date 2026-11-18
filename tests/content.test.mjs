import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import ts from "typescript";
const js = ts.transpileModule(readFileSync("src/content/products.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { products, flows } = await import(
  "data:text/javascript;base64," + Buffer.from(js).toString("base64")
);
test("exact current product set, unique identities and source evidence", () => {
  assert.deepEqual(
    products.map((p) => p.id),
    ["piras", "medhas", "vajra"],
  );
  for (const p of products) {
    assert.ok(p.capabilities.length >= 5);
    assert.ok(p.details);
    assert.ok(p.boundary);
    assert.ok(p.paths.length >= 3);
    assert.match(p.revision, /^[a-f0-9]{7,8}$/);
    assert.ok(
      p.url.startsWith("https://github.com/Tvastr-Industrial-Intelligence/"),
    );
  }
});
test("MIS is part of Medhas; connections do not imply automated changes", () => {
  assert.ok(
    products
      .find((p) => p.id === "medhas")
      .capabilities.flat()
      .some((x) => x.includes("MIS is also offered standalone")),
  );
  assert.match(
    products.find((p) => p.id === "vajra").boundary,
    /carried out separately/,
  );
  assert.match(
    products.find((p) => p.id === "vajra").details,
    /start with a user request/,
  );
});
test("workflows have four steps and valid product owners", () => {
  assert.equal(flows.length, 3);
  for (const f of flows) {
    assert.ok(products.some((p) => p.id === f.product));
    assert.equal(f.steps.length, 4);
    assert.ok(f.detail);
  }
});
function text(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .map((e) =>
      e.isDirectory()
        ? text(dir + "/" + e.name)
        : readFileSync(dir + "/" + e.name, "utf8"),
    )
    .join("\n");
}
test("obsolete plans, client names and made-up telemetry are not shipped", () => {
  const source = text("src");
  assert.doesNotMatch(
    source,
    /SCADA|Business Cortex|Client Cortex|Castco|VeeCast|SIPL|Lyapunov|Math\.random|WebSocket|localhost:800|94%|Running Cortex/i,
  );
  assert.match(source, /describes the product components/);
});
test("navigation and closed disclosure affordances are retained", () => {
  const app = readFileSync("src/App.tsx", "utf8");
  for (const v of ["Overview", "Products", "Data flow", "Technical details"])
    assert.ok(app.includes(v));
  assert.match(app, /aria-current/);
  assert.match(app, /aria-label="Find a capability"/);
  assert.match(app, /<details/);
  assert.doesNotMatch(app, /<details[^>]*\sopen[ =>]/);
  assert.doesNotMatch(
    readFileSync("index.html", "utf8"),
    /overflow:\s*hidden|vite\.svg/,
  );
});
