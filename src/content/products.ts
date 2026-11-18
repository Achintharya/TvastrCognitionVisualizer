export type ProductId = "piras" | "medhas" | "vajra";
export const products = [
  {
    id: "piras" as ProductId,
    name: "PIRAS",
    number: "01",
    role: "Inspection & quality intelligence",
    verb: "Casting inspection",
    color: "#8cb5ff",
    summary:
      "Inspects casting images, records defects and links results to production context.",
    input: "Casting images · ERP production context",
    output: "Defect evidence · Review records · Quality reports",
    capabilities: [
      [
        "Image inspection",
        "Detect casting regions and analyse image patches for defect evidence.",
      ],
      [
        "Human review",
        "Review inspection results, correct defect labels and record Reject or Rework dispositions.",
      ],
      [
        "Production traceability",
        "Connect inspections to available part, mould and heat context from ERP records.",
      ],
      [
        "Quality analysis",
        "Explore rejection trends, SPC, FMEA and quality-gate attribution.",
      ],
      [
        "Reports & history",
        "Keep inspection history and generate inspection and analysis reports.",
      ],
    ],
    details:
      "The Python inspection runtime combines detection, patch/signal analysis and configured reasoning. Classification backends and optional model-assisted reasoning depend on configuration. A defect label is distinct from a review disposition. Browser UI source is maintained separately and exported into the PIRAS service.",
    boundary:
      "Inspection results require human review. Root-cause assessment requires production evidence. Review-learning and software updates require validation with real data on the installed version.",
    modules: [
      "Inspection runtime",
      "Image History",
      "Human Review",
      "Analysis",
      "Stability / SPC",
      "Quality & Risk",
      "Reports",
    ],
    source: "PIRASCortex",
    revision: "d0de0aee",
    paths: [
      "core/cognition_runtime/orchestrator.py",
      "core/pipeline/run_pipeline.py",
      "services/api/api.py",
    ],
    url: "https://github.com/Tvastr-Industrial-Intelligence/PIRASCortex",
  },
  {
    id: "medhas" as ProductId,
    name: "Medhas",
    number: "02",
    role: "ERP & operational records",
    verb: "ERP & operations",
    color: "#7ed9b5",
    summary:
      "Manages employee access, manufacturing records, documents and MIS.",
    input: "Employee entries · Master data · Documents · MIS imports",
    output: "Structured records · Approval history · Searchable context",
    capabilities: [
      [
        "People & permissions",
        "Employee identity, roles, departments and plant-scoped access.",
      ],
      [
        "Manufacturing operations",
        "Sales, purchasing, inventory, production, quality and dispatch workflows.",
      ],
      [
        "Connected records",
        "Manufacturing master data, BOMs, routings and entity relationships.",
      ],
      [
        "Documents & search",
        "Store original documents, process their contents and search with source context.",
      ],
      [
        "Built-in MIS",
        "Management dashboards, data imports and reporting within Medhas. MIS is also offered standalone.",
      ],
      [
        "Approvals & activity",
        "Controlled changes, notifications and audit records make actions traceable.",
      ],
    ],
    details:
      "FastAPI serves the employee UI and APIs. SQLite stores ERP, identity, relationships and audit data; MIS has its own operational database. Document originals and metadata are retained alongside a rebuildable vector index. Registered ERP routes implement the listed operations; breadth of support varies by workflow.",
    boundary:
      "PIRAS runs as a separate service with its own access controls. Available ERP workflows and MIS integrations depend on the installation.",
    modules: [
      "Identity & organisation",
      "Master data",
      "Sales & CRM",
      "Purchasing & inventory",
      "Production",
      "Quality",
      "Dispatch",
      "Documents",
      "MIS",
    ],
    source: "Medhas",
    revision: "4ce0a0b",
    paths: [
      "docs/ARCHITECTURE.md",
      "knowledge_acquisition/erp/api/routes.py",
      "knowledge_acquisition/mis/api/routes.py",
    ],
    url: "https://github.com/Tvastr-Industrial-Intelligence/Medhas",
  },
  {
    id: "vajra" as ProductId,
    name: "Vajra",
    number: "03",
    role: "Evidence-grounded investigation",
    verb: "Investigation",
    color: "#edba77",
    summary:
      "Retrieves records from configured sources and uses them to answer questions and investigate issues.",
    input: "A question · Available PIRAS and Medhas / MIS evidence",
    output: "Investigations · Explanations · Evidence references",
    capabilities: [
      [
        "Question-led retrieval",
        "Route a request to relevant configured data sources and retrieve evidence.",
      ],
      [
        "PIRAS evidence",
        "Read inspection records and computed quality analytics through one PIRAS source.",
      ],
      [
        "Medhas & MIS context",
        "Use authorised document-search results and management data to inform an investigation.",
      ],
      [
        "Inspection images",
        "Show related image evidence with part, mould and recorded-date context when available.",
      ],
      [
        "Investigation records",
        "Track investigations and assemble evidence-backed audit and answer outputs.",
      ],
    ],
    details:
      "Investigations start with a user request. One PIRAS adapter combines database records with an HTTP analytics client. Medhas integration supports a service identity with renewable credentials. Retrieval and reasoning depend on configured sources, available records and model services.",
    boundary:
      "Available answers depend on connected sources and model services. Findings require human review; changes to ERP records and production are carried out separately.",
    modules: [
      "Query routing",
      "Source adapters",
      "Evidence retrieval",
      "Investigation state",
      "Answer synthesis",
      "Inspection image cards",
    ],
    source: "VajraCortex",
    revision: "c95fa9f",
    paths: [
      "core/retrieval/adapters/piras_adapter.py",
      "core/retrieval/adapters/medhas_auth.py",
      "core/investigation/runtime.py",
    ],
    url: "https://github.com/Tvastr-Industrial-Intelligence/VajraCortex",
  },
];
export const flows = [
  {
    id: "inspection",
    name: "Inspect a casting",
    product: "piras" as ProductId,
    intro: "Casting inspection and review",
    steps: [
      [
        "Capture & identify",
        "Provide casting images and the available production context.",
      ],
      [
        "Analyse the evidence",
        "PIRAS detects regions and analyses image patches using its configured inspection pipeline.",
      ],
      [
        "Review the result",
        "A person can correct the defect label and record a Reject or Rework disposition.",
      ],
      [
        "Trace & report",
        "Keep the inspection evidence with available part, mould and heat context; review it in history and reports.",
      ],
    ],
    detail:
      "Inspection results and processing time depend on the image, models and installation. Changes to production models require validation.",
  },
  {
    id: "operations",
    name: "Connect operations",
    product: "medhas" as ProductId,
    intro: "Operational records and reporting",
    steps: [
      [
        "Enter with permission",
        "An employee signs in with their role and plant access.",
      ],
      [
        "Maintain records",
        "Use master data and the relevant manufacturing workflow to create linked records.",
      ],
      [
        "Review controlled changes",
        "Applicable approvals, notifications and activity history preserve accountability.",
      ],
      [
        "Make context useful",
        "Find documents and records, or use built-in MIS dashboards and reports.",
      ],
    ],
    detail:
      "Records, documents and MIS are separate subsystems within Medhas. Available workflows and ERP connectors depend on installation and configuration.",
  },
  {
    id: "investigation",
    name: "Investigate a question",
    product: "vajra" as ProductId,
    intro: "Question-led investigation",
    steps: [
      [
        "Ask a focused question",
        "An investigation starts with a user request.",
      ],
      [
        "Retrieve relevant evidence",
        "Vajra uses configured PIRAS and Medhas / MIS sources.",
      ],
      [
        "Build the investigation",
        "Reason over retrieved context and assemble supporting evidence.",
      ],
      [
        "Examine the answer",
        "Review the explanation and available references or inspection images.",
      ],
    ],
    detail:
      "Vajra retrieves evidence when a user submits a question. Answers depend on source availability and configuration. Production changes require a separate action.",
  },
];
