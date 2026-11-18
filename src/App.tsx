import { useEffect, useRef, useState } from "react";
import { products, flows } from "./content/products";
import type { ProductId } from "./content/products";

type View = "Overview" | "Products" | "Data flow" | "Technical details";
const views: View[] = [
  "Overview",
  "Products",
  "Data flow",
  "Technical details",
];
function Arrow({ className = "" }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      ↗
    </span>
  );
}
function ProductIcon({ id }: { id: ProductId }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      {id === "piras" ? (
        <>
          <path d="M3 8V3h5m8 0h5v5M3 16v5h5m8 0h5v-5" />
          <circle cx="12" cy="12" r="4" />
        </>
      ) : id === "medhas" ? (
        <>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h4" />
        </>
      ) : (
        <>
          <path d="m13 2-8 12h6l-1 8 9-13h-7l1-7Z" />
        </>
      )}
    </svg>
  );
}
export default function App() {
  const [view, setView] = useState<View>("Overview"),
    [selected, setSelected] = useState<ProductId>("piras"),
    [flow, setFlow] = useState("inspection"),
    [query, setQuery] = useState(""),
    [light, setLight] = useState(false);
  const search = useRef<HTMLInputElement>(null),
    main = useRef<HTMLElement>(null);
  const product = products.find((p) => p.id === selected)!,
    currentFlow = flows.find((f) => f.id === flow)!;
  const results = products.filter((p) =>
    (
      p.name +
      " " +
      p.summary +
      " " +
      p.capabilities.flat().join(" ") +
      " " +
      p.modules.join(" ")
    )
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  function go(next: View) {
    setView(next);
    setQuery("");
    window.scrollTo(0, 0);
  }
  function open(id: ProductId) {
    setSelected(id);
    go("Products");
  }
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setQuery("");
        search.current?.blur();
      }
      if (e.key === "/" && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        search.current?.focus();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  return (
    <div className={`app ${light ? "light" : ""}`}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="header">
        <button
          className="brand"
          onClick={() => go("Overview")}
          aria-label="Tvastr Cognition home"
        >
          <span className="brand-mark">✳</span>
          <span>
            TVASTR<span className="brand-sub">COGNITION / VISUALIZER</span>
          </span>
        </button>
        <nav aria-label="Main navigation">
          {views.map((v) => (
            <button
              key={v}
              aria-current={view === v ? "page" : undefined}
              className={view === v ? "active" : ""}
              onClick={() => go(v)}
            >
              {v}
            </button>
          ))}
        </nav>
        <button
          className="theme"
          onClick={() => setLight(!light)}
          aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
        >
          {light ? "◐" : "◑"}
        </button>
      </header>
      <div className="workspace">
        <aside className="rail">
          <div className="rail-top">
            <span className="eyebrow">TVASTR PRODUCTS</span>
            <h2>
              PIRAS, Medhas & Vajra
            </h2>
            <p>
              Product functions, components and data connections.
            </p>
          </div>
          <label className="search">
            <span aria-hidden="true">⌕</span>
            <input
              ref={search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a capability"
              aria-label="Find a capability"
            />
            <kbd>/</kbd>
          </label>
          <div className="product-links" aria-label="Products">
            {(query ? results : products).map((p) => (
              <button
                key={p.id}
                onClick={() => open(p.id)}
                className={
                  selected === p.id && view === "Products" ? "selected" : ""
                }
                style={{ "--product": p.color } as React.CSSProperties}
              >
                <ProductIcon id={p.id} />
                <span>
                  <strong>{p.name}</strong>
                  <small>{p.role}</small>
                </span>
                <Arrow />
              </button>
            ))}
            {query && !results.length && (
              <p className="no-results">
                No matching capability. Try inspection, documents or reports.
              </p>
            )}
          </div>
          <div className="rail-bottom">
            <span className="scope-dot" /> Product architecture
            <p>Components and data flows.</p>
            <span className="edition">UPDATED / 19 NOV 2026</span>
          </div>
        </aside>
        <main id="main" ref={main} tabIndex={-1}>
          <div className="breadcrumb">
            <button onClick={() => go("Overview")}>Tvastr</button>
            <span>/</span>
            <span>{view}</span>
            {view === "Products" && (
              <>
                <span>/</span>
                <span>{product.name}</span>
              </>
            )}
          </div>
          {view === "Overview" && (
            <>
              <section className="hero">
                <div>
                  <p className="eyebrow accent">
                    TVASTR COGNITION VISUALIZER
                  </p>
                  <h1>
                    PIRAS, Medhas
                    <br />
                    <span>& Vajra.</span>
                  </h1>
                  <p className="lead">
                    PIRAS handles inspection and quality analysis. Medhas manages
                    operational records. Vajra investigates questions using their data.
                  </p>
                </div>
                <div className="hero-note">
                  <span className="tiny-line" />
                  <p>
                    Inspection.<br />ERP.<br /><strong>Investigation.</strong>
                  </p>
                </div>
              </section>
              <section className="map-section" aria-labelledby="map-title">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">01 / SYSTEM MAP</span>
                    <h2 id="map-title">Product connections</h2>
                  </div>
                  <span className="subtle">
                    Select a product for details <Arrow />
                  </span>
                </div>
                <div className="system-map">
                  <svg
                    className="connections"
                    viewBox="0 0 1000 430"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path d="M250 150 C250 330 500 190 500 340" />
                    <path d="M750 150 C750 330 500 190 500 340" />
                    <path className="link-path" d="M370 95 L630 95" />
                  </svg>
                  <span className="map-link">Opens a separate workspace</span>
                  <div className="map-products">
                    {[products[1], products[0], products[2]].map((p) => (
                      <button
                        key={p.id}
                        className={`map-card ${p.id}`}
                        onClick={() => open(p.id)}
                        style={{ "--product": p.color } as React.CSSProperties}
                      >
                        <div className="card-top">
                          <ProductIcon id={p.id} />
                          <span>
                            {p.number} /{" "}
                            {p.id === "vajra"
                              ? "INVESTIGATION"
                              : p.id === "piras"
                                ? "QUALITY"
                                : "OPERATIONS"}
                          </span>
                          <Arrow />
                        </div>
                        <h3>{p.name}</h3>
                        <p>{p.role}</p>
                        <div className="card-rule" />
                        <small>
                          {p.id === "medhas"
                            ? "ERP records + documents + MIS"
                            : p.id === "piras"
                              ? "Images + inspection evidence"
                              : "Questions + retrieved evidence"}
                        </small>
                      </button>
                    ))}
                  </div>
                  <span className="path-label left">Medhas / MIS context</span>
                  <span className="path-label right">
                    Inspection records + analytics
                  </span>
                </div>
                <div className="mobile-evidence" aria-label="Evidence relationships">
                  <span>Medhas / MIS → Vajra <small>Records & document context</small></span>
                  <span>PIRAS → Vajra <small>Inspection records & analytics</small></span>
                </div>
                <div className="map-caption">
                  <span>DATA CONNECTIONS</span>
                  <p>
                    Medhas links people and operational records. PIRAS holds
                    inspection evidence. Vajra retrieves from configured sources
                    when you ask a question.
                  </p>
                </div>
              </section>
              <section className="role-grid">
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => open(p.id)}
                    className="role-card"
                  >
                    <span className="eyebrow" style={{ color: p.color }}>
                      {p.number} / {p.name}
                    </span>
                    <h2>{p.verb}</h2>
                    <p>{p.summary}</p>
                    <span className="text-link">
                      View {p.name} <Arrow />
                    </span>
                  </button>
                ))}
              </section>
              <div className="next-strip">
                <div>
                  <span className="eyebrow">WORKFLOWS</span>
                  <h2>Inspection, operations and investigation</h2>
                </div>
                <button className="primary" onClick={() => go("Data flow")}>
                  View data flow <Arrow />
                </button>
              </div>
            </>
          )}
          {view === "Products" && (
            <section
              className="product-view"
              style={{ "--product": product.color } as React.CSSProperties}
            >
              <button className="back" onClick={() => go("Overview")}>
                ← System overview
              </button>
              <div className="product-head">
                <span className="product-icon">
                  <ProductIcon id={product.id} />
                </span>
                <p className="eyebrow">
                  {product.number} / {product.role}
                </p>
                <h1>
                  {product.name}
                  <span>.</span>
                </h1>
                <p className="lead">{product.summary}</p>
              </div>
              <div className="io-grid">
                <div>
                  <span className="eyebrow">WORKS WITH</span>
                  <p>{product.input}</p>
                </div>
                <div>
                  <span className="eyebrow">MAKES AVAILABLE</span>
                  <p>{product.output}</p>
                </div>
              </div>
              <h2 className="subheading">Features</h2>
              <div className="capability-grid">
                {product.capabilities.map(([name, desc], i) => (
                  <article className="capability" key={name}>
                    <span className="step-index">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3>{name}</h3>
                    <p>{desc}</p>
                  </article>
                ))}
              </div>
              <details key={product.id} className="detail">
                <summary>
                  Technical details <span>Components & limitations +</span>
                </summary>
                <div>
                  <h3>How it is organised</h3>
                  <p>{product.details}</p>
                  <div className="tags">
                    {product.modules.map((m) => (
                      <span key={m}>{m}</span>
                    ))}
                  </div>
                  <h3>Limitations</h3>
                  <p>{product.boundary}</p>
                  <Source product={product} />
                </div>
              </details>
              <button
                className="primary"
                onClick={() => {
                  setFlow(flows.find((f) => f.product === product.id)!.id);
                  go("Data flow");
                }}
              >
                View the {product.name} workflow <Arrow />
              </button>
            </section>
          )}
          {view === "Data flow" && (
            <section>
              <div className="page-head">
                <p className="eyebrow accent">PRODUCT WORKFLOWS</p>
                <h1>Data flow</h1>
                <p className="lead">
                  Steps for inspection, operational records and investigation.
                </p>
              </div>
              <div
                className="flow-tabs"
                role="group"
                aria-label="Choose a workflow"
              >
                {flows.map((f) => (
                  <button
                    key={f.id}
                    aria-pressed={flow === f.id}
                    className={flow === f.id ? "active" : ""}
                    onClick={() => setFlow(f.id)}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
              <div className="flow-body">
                <div className="flow-intro">
                  <span
                    className="eyebrow"
                    style={{
                      color: products.find((p) => p.id === currentFlow.product)!
                        .color,
                    }}
                  >
                    {currentFlow.product.toUpperCase()}
                  </span>
                  <h2>{currentFlow.intro}</h2>
                  <button
                    className="text-link"
                    onClick={() => open(currentFlow.product)}
                  >
                    View product details <Arrow />
                  </button>
                </div>
                <ol className="steps">
                  {currentFlow.steps.map(([name, desc], i) => (
                    <li key={name}>
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <h3>{name}</h3>
                        <p>{desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <details className="detail">
                <summary>
                  Workflow details <span>Configuration & limitations +</span>
                </summary>
                <div>
                  <p>{currentFlow.detail}</p>
                </div>
              </details>
              <section className="relationship-note">
                <h3>Product connections</h3>
                <p>
                  <strong>Medhas → PIRAS</strong> is navigation to a separate
                  workspace. <strong>PIRAS → Vajra</strong> and{" "}
                  <strong>Medhas / MIS → Vajra</strong> represent evidence
                  retrieval.
                </p>
              </section>
            </section>
          )}
          {view === "Technical details" && (
            <section>
              <div className="page-head">
                <p className="eyebrow accent">SYSTEM COMPONENTS</p>
                <h1>Technical details</h1>
                <p className="lead">
                  Runtime components, data storage, integrations and source files.
                </p>
              </div>
              <div className="evidence-note">
                <span className="scope-dot" />
                <div>
                  <h3>Product architecture</h3>
                  <p>
                    This visualizer describes the product components and their
                    connections.
                  </p>
                </div>
              </div>
              {products.map((p) => (
                <details className="detail" key={p.id}>
                  <summary>
                    <span className="summary-name">
                      <ProductIcon id={p.id} />
                      {p.name}
                    </span>
                    <span>Components, sources & limitations +</span>
                  </summary>
                  <div>
                    <p>{p.details}</p>
                    <h3>Limitations</h3>
                    <p>{p.boundary}</p>
                    <Source product={p} />
                  </div>
                </details>
              ))}
              <details className="detail">
                <summary>
                  Deployment & configuration <span>Product structure +</span>
                </summary>
                <div>
                  <p>
                    Capabilities are grouped by the product that owns the
                    workflow. MIS is built into Medhas and is also offered as a
                    standalone product. The PIRAS web UI is maintained in a
                    separate frontend repository and exported into its service.
                  </p>
                  <p>
                    Features depend on the installation, permissions, available
                    data and configuration. Optional model services may require
                    external connections.
                  </p>
                  <a
                    className="source-link"
                    href="https://github.com/Tvastr-Industrial-Intelligence/plant_intelligence"
                    target="_blank"
                    rel="noreferrer"
                  >
                    PIRAS frontend source <Arrow />
                  </a>
                </div>
              </details>
            </section>
          )}
          <footer>
            <span>TVASTR / COGNITION VISUALIZER</span>
            <span>Product components & data flows</span>
            <button onClick={() => go("Technical details")}>
              Technical details <Arrow />
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
function Source({ product }: { product: (typeof products)[number] }) {
  return (
    <div className="source">
      <span className="eyebrow">
        SOURCE VERSION / {product.revision}
      </span>
      <a href={product.url} target="_blank" rel="noreferrer">
        {product.source} <Arrow />
      </a>
      <ul>
        {product.paths.map((p) => (
          <li key={p}>
            <code>{p}</code>
          </li>
        ))}
      </ul>
      <small>
        Source version: 19 Nov 2026. Repository access may be required.
      </small>
    </div>
  );
}
