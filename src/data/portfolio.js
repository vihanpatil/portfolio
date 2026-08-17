export const portfolio = {
  seo: {
    title: "Vihan Patil — Software Engineer",
    description:
      "Software engineer working on retrieval systems that cite their sources, autonomous drone perception, and the backends underneath both. M.S. CSE, UC Santa Cruz.",
  },

  profile: {
    name: "Vihan Patil",
    role: "Software Engineer",
    // Split so the hero can set each line separately.
    headline: ["I build systems", "that have to be", "right."],
    lede: "Retrieval pipelines that cite their sources. Drone perception that holds its coverage while dodging. The unglamorous backend work that keeps both honest.",
    now: "M.S. in Computer Science and Engineering, UC Santa Cruz — finished March 2026. Two years in the AI Explainability & Accountability Lab, two summers writing flight software at Vaara Drone. Currently looking for a full-time software engineering role.",
    email: "vihanpatil7@gmail.com",
    phone: "(408) 529-1810",
    location: "San Jose, CA",
    availability: "Open to full-time SWE roles · US Citizen · On-site, hybrid, or remote",
    github: "vihanpatil",
    linkedin: "https://www.linkedin.com/in/vihan-patil",
    resume: "/Vihan_Patil_Resume.pdf",
  },

  signals: [
    { figure: "75%", unit: "throughput", note: "Image-pipeline gain at Vaara Drone, from rewriting ingestion as an async multiprocessing stage." },
    { figure: "150+", unit: "students", note: "Supported across four quarters as a UCSC teaching assistant for TIM 172." },
    { figure: "2", unit: "years", note: "In the UCSC AIEA Lab on retrieval, citation tracing, and multi-model verification." },
  ],

  about: {
    lines: [
      "I spent two years in a research lab whose entire premise is that a model's answer is worthless if you can't trace where it came from. That shaped how I build: citation tracing, verification passes, and a bias toward systems that can show their work.",
      "The other half of my experience is the opposite kind of constraint. At Vaara Drone the code ran on a Raspberry Pi bolted to an airframe, where a slow frame is not a latency metric, it's a missed field. I rewrote the image ingestion path as an async multiprocessing pipeline and got 75% more throughput out of the same hardware.",
      "Both jobs came down to the same thing: know what your system does when it's wrong, and build so that's recoverable.",
    ],
  },

  timeline: [
    {
      kind: "work",
      org: "UCSC AI Explainability & Accountability Lab",
      role: "Graduate Researcher",
      from: "Sep 2024",
      to: "Mar 2026",
      body: "Research on making generated answers traceable and checkable rather than merely fluent.",
      points: [
        "Architected RAG pipelines with citation tracing and cross-model LLM verification to cut hallucinated claims and make the remaining ones auditable.",
        "Prototyped a lightweight LLM-evaluation harness scoring faithfulness, citation accuracy, and answer relevance over a curated knowledge base.",
        "Integrated neurosymbolic workflows combining knowledge-graph retrieval with transformer models for auditable, structured reasoning chains.",
      ],
      stack: ["Python", "RAG", "Knowledge Graphs", "LLM Evaluation"],
    },
    {
      kind: "work",
      org: "University of California, Santa Cruz",
      role: "Teaching Assistant — Management of Technology (TIM 172)",
      from: "Sep 2025",
      to: "Mar 2026",
      body: "Management of Technology coursework: grading operations, rubrics, office hours, project reviews.",
      points: [
        "Kept evaluation consistent across a 150+ student course by owning rubric design and grading workflow.",
        "Ran project check-ins and office hours, assessing product concepts and end-to-end supply chain strategy.",
      ],
      stack: ["Rubric Design", "Grading Ops", "Mentoring"],
    },
    {
      kind: "work",
      org: "Vaara Drone",
      role: "Software Engineering Intern — Return",
      from: "Jun 2025",
      to: "Sep 2025",
      body: "Drone image processing and simulated reinforcement-learning landing policies.",
      points: [
        "Rewrote image ingestion and preprocessing as an asynchronous multiprocessing pipeline — 75% throughput improvement on the same hardware, with tuned OpenCV and NDVI stages.",
        "Simulated and evaluated RL landing policies for high-precision autonomous landing, focused on stability, convergence, and safety constraints.",
      ],
      stack: ["Python", "OpenCV", "NDVI", "Multiprocessing", "Reinforcement Learning"],
    },
    {
      kind: "work",
      org: "Vaara Drone",
      role: "Software Engineering Intern",
      from: "Jun 2024",
      to: "Sep 2024",
      body: "Edge-based mapping and evaluation tooling for low-latency area surveillance.",
      points: [
        "Built a drone mapping pipeline running on-device on a Raspberry Pi, with real-time object detection for area surveillance.",
        "Wrote evaluation tooling around MAVLink command and telemetry to keep area mapping reliable in flight.",
      ],
      stack: ["Raspberry Pi", "MAVLink", "Object Detection", "Edge Compute"],
    },
    {
      kind: "edu",
      org: "University of California, Santa Cruz",
      role: "M.S., Computer Science and Engineering",
      from: "Sep 2024",
      to: "Mar 2026",
      body: "GPA 3.77/4.00 — coursework in machine learning, deep learning, natural language processing, computer vision, and distributed systems.",
      points: [],
      stack: [],
    },
    {
      kind: "edu",
      org: "University of California, Santa Cruz",
      role: "B.S., Computer Science",
      from: "Sep 2020",
      to: "Jun 2024",
      body: "Systems and software foundation: algorithms, databases, statistics, AI, ML, computer vision.",
      points: [],
      stack: [],
    },
  ],

  projects: [
    {
      slug: "healthwise",
      name: "HealthWise",
      tag: "M.S. Capstone",
      period: "Sep 2025 — Mar 2026",
      window: "video",
      categories: ["Agentic RAG", "Health", "LLM Verification"],
      blurb:
        "An agentic RAG health coach that refuses to answer from vibes. Retrieval is grounded, claims are verified against sources before they reach the user, and wearable data feeds the coaching context.",
      detail:
        "The interesting problem wasn't generating nutrition advice — any model does that. It was building the verification loop that catches the model when its answer drifts from what the retrieved evidence actually supports, and making the citation visible so a user can check it. Responses are grounded in a curated corpus of 60+ nutrition-research documents.",
      video: { id: "CIY4ehuy7zg", title: "HealthWise Demo", duration: "Demo walkthrough" },
      repo: "https://github.com/vihanpatil/HealthWise",
      stack: ["Python", "RAG", "Verification Loops", "Health Data Sync", "LLM Orchestration"],
      architecture: [
        { id: "intake", label: "Intake", detail: "User question plus wearable context — sleep, activity, and trend data pulled from watch sync — assembled into a single grounded query." },
        { id: "retrieve", label: "Retrieve", detail: "Passages retrieved and ranked from a curated corpus of 60+ nutrition-research documents. Every passage carries its identifier forward so a claim can be traced back to it later." },
        { id: "draft", label: "Draft", detail: "The coaching model drafts a response constrained to the retrieved passages rather than open-ended generation." },
        { id: "verify", label: "Verify", detail: "The verification pass re-checks each claim against the passages that were actually retrieved. Unsupported claims are dropped or sent back for another retrieval round." },
        { id: "cite", label: "Cite", detail: "The surviving answer ships with its citations attached, so the user sees the evidence rather than being asked to trust the model." },
      ],
    },
    {
      slug: "swathkeeper",
      name: "SwathKeeper",
      tag: "Active personal project",
      period: "ArduPilot SITL · Gazebo · ROS 2",
      window: "coverage",
      status: "In progress — reactive avoidance demonstrated end-to-end; NDVI mapping next",
      categories: ["Robotics", "Path Planning", "Autonomy"],
      blurb:
        "An autonomous crop-survey drone in simulation. Commercial platforms fly pre-surveyed static missions; SwathKeeper adds the part they skip — a live AUTO→GUIDED→AUTO takeover that dodges an unplanned obstacle mid-survey, then resumes the mission without silently losing the cells it was supposed to cover.",
      detail:
        "The dodge itself is a geofence-vetted 3D maneuver running live on the ArduPilot SITL + Gazebo + ROS 2 stack. The part I care most about is the ledger invariant underneath it: every scan cell is accounted for, and any cell silently skipped fails the suite — 94 automated tests in CI enforce it. The planner below runs the same idea — drag an obstacle and watch the route re-plan without abandoning coverage.",
      repo: "https://github.com/vihanpatil/SwathKeeper",
      stack: ["ROS 2", "Gazebo", "ArduPilot SITL", "Python", "Path Planning", "OpenCV"],
    },
    {
      slug: "finscreen",
      name: "FinScreen",
      tag: "Research pipeline",
      period: "SEC EDGAR · Claude Batch API",
      window: "pipeline",
      status: "In progress — 6,400-example labeled corpus produced; signal modeling next",
      categories: ["NLP", "Data Engineering", "LLMs"],
      blurb:
        "An NLP research pipeline over SEC EDGAR: 10-K, 10-Q and 8-K filings for 25 companies across 9 quarters, distilled into a labeled corpus for financial text-signal research — with the metadata discipline to keep every label honest about what the market knew, and when.",
      detail:
        "Financial text is booby-trapped. Boilerplate repeats filing after filing, and any label that peeks past the filing date poisons the dataset. The labeling pass — 6,400 weak-supervision examples across sentiment, a red-flag taxonomy, and guidance direction — ran through the Claude Batch API behind boilerplate deduplication and look-ahead-bias-safe prompts.",
      stack: ["Python", "NLP", "SEC EDGAR", "Claude Batch API", "Weak Supervision", "pandas"],
      architecture: [
        { id: "ingest", label: "Ingest", detail: "Pulls 10-K, 10-Q and 8-K filings from SEC EDGAR for 25 companies across 9 quarters, stamping point-in-time metadata so every document knows when the market could actually have read it." },
        { id: "extract", label: "Extract", detail: "Isolates the sections that carry signal — MD&A, risk factors, and press-release text — from the legal boilerplate wrapped around them." },
        { id: "dedupe", label: "Dedupe", detail: "Strips boilerplate that repeats filing-to-filing, so the corpus rewards newly written language instead of re-counting the same paragraph nine quarters in a row." },
        { id: "label", label: "Label", detail: "Weak-supervision labeling through the Claude Batch API — sentiment, a red-flag taxonomy, and guidance direction — with prompts constructed to be look-ahead-bias-safe, so the labeler never sees the future." },
        { id: "corpus", label: "Corpus", detail: "6,400 labeled examples with point-in-time integrity, ready for signal modeling and backtests that don't accidentally cheat." },
      ],
    },
    {
      slug: "matchdesk",
      name: "MatchDesk",
      tag: "In progress",
      period: "Claude API",
      window: "match",
      status: "Partly built — scoring mechanic below runs on sample data",
      categories: ["AI", "Full-Stack", "SPA"],
      blurb:
        "Resume-to-job matching that explains itself: it scores a resume against a posting and shows which requirements are actually covered, which are thin, and which are missing outright.",
      detail:
        "A single match percentage tells you nothing actionable — the useful output is which requirement you failed and why. The widget below runs that scoring mechanic client-side on sample data, so you can see how coverage is computed without an API key.",
      repo: "https://github.com/vihanpatil/matchdesk",
      stack: ["TypeScript", "React", "Claude API", "Vite"],
    },
    {
      slug: "blockchain-analytics",
      name: "Blockchain Analytics",
      tag: "Client work · UXly",
      period: "Jan 2024 — Jun 2024",
      window: "pipeline",
      categories: ["Full-Stack", "Real-Time Data", "Web3"],
      blurb:
        "Real-time on-chain visualization and smart-contract analysis, built with a team directly for the CEO of UXly — a small startup — after the engagement grew out of a UCSC course project.",
      detail:
        "The React front end was the easy half. The real work was an ingestion layer that keeps up with block production, degrades gracefully when an upstream node stalls, and doesn't lose events while reconnecting.",
      stack: ["TypeScript", "React", "Node.js", "Express", "Docker", "AWS EC2"],
      architecture: [
        { id: "rpc", label: "RPC Feed", detail: "Subscribes to new blocks across multiple endpoints, so a single stalled node doesn't stall ingestion." },
        { id: "ingest", label: "Ingest", detail: "Normalizes raw block and transaction payloads, with retry and backoff around unreliable upstream responses." },
        { id: "decode", label: "Decode", detail: "Decodes contract calls and event logs against known ABIs to turn opaque calldata into readable interactions." },
        { id: "store", label: "Store", detail: "Persists decoded events with the checkpointing needed to resume mid-stream after a reconnect instead of re-scanning." },
        { id: "stream", label: "Stream", detail: "Pushes updates to the React client so the visualization tracks chain state in near real time." },
      ],
    },
  ],

  /* Secondary work — real repos and client engagements that add signal
     without diluting the flagship set. */
  archive: [
    {
      name: "Retrieval Algorithm Benchmarking",
      period: "Mar 2026",
      repo: "https://github.com/vihanpatil/Retrieval-Algorithm-Benchmarking",
      blurb:
        "A benchmarking harness for the ANN vector indexes underneath RAG retrieval. Automated parameter sweeps over five backends (FAISS Flat, HNSW, IVF-PQ, OPQ; hnswlib) on 50K-vector embedding datasets, measuring recall@k, p50/p95/p99 latency, QPS, memory, and index size. Mapping the recall/latency frontier surfaced FAISS HNSW configurations sustaining perfect recall@10 at 54K QPS — a 3.3× throughput gain over exact flat search at 3× lower median latency, with negligible index-size overhead.",
      stack: ["Python", "FAISS", "hnswlib", "Benchmarking"],
    },
    {
      name: "SatML Document Intelligence",
      period: "Competition · 2025",
      repo: "https://github.com/vihanpatil/SatMLCompetition-DocumentIntelligence",
      blurb:
        "Track 2 of the SatML Document Intelligence competition: reconstructing redacted key-value pairs from documents by querying a black-box DocVQA model that may have been trained with differential privacy. An adversarial look at what a model still leaks after redaction.",
      stack: ["Python", "DocVQA", "Differential Privacy", "Black-Box Attacks"],
    },
    {
      name: "AIEA Auditor",
      period: "UCSC AIEA Lab · 2024",
      repo: "https://github.com/vihanpatil/AIEA_Auditor",
      blurb:
        "Auditing tooling written during my time in the AI Explainability & Accountability Lab — the working code behind the research described above.",
      stack: ["Python", "Auditing", "LLM Evaluation"],
    },
    {
      name: "FlashGOV",
      period: "Client work · UXly partner team · Oct — Dec 2023",
      blurb:
        "A scraping and summarization pipeline over Chinese government websites producing multilingual summaries, with multi-model verification and cross-language checks to catch summaries that drift from the source. Built with a team for a partner group of UXly, originating from a UCSC course.",
      stack: ["Python", "Scraping", "Summarization", "Multi-Model Verification"],
    },
  ],

  skills: [
    {
      group: "Languages",
      items: ["Python", "TypeScript", "JavaScript", "SQL", "C", "C++", "Java"],
    },
    {
      group: "AI / ML",
      items: [
        "RAG Pipelines",
        "LLM Evaluation",
        "Embeddings",
        "Vector Search (FAISS · HNSW)",
        "Knowledge Graph Retrieval",
        "Multi-LLM Verification",
        "Citation Tracing",
        "Agentic Workflows",
        "PyTorch",
        "TensorFlow",
        "scikit-learn",
        "Reinforcement Learning",
      ],
    },
    {
      group: "Vision / Robotics",
      items: ["OpenCV", "NDVI Processing", "Object Detection", "ROS 2", "Gazebo", "ArduPilot SITL", "MAVLink"],
    },
    {
      group: "Backend / Infra",
      items: ["Node.js", "Express", "React", "REST APIs", "Docker", "Kubernetes", "CI/CD", "Linux", "AWS EC2", "GCP Storage"],
    },
  ],
};
