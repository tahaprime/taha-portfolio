/**
 * PROJECTS: each entry below becomes a card, a row in /projects and a full case-study
 * page at /projects/<slug>/. Order = order on the site (numbers are automatic).
 *
 * Add one:      npm run new:project -- my-slug "My Project"   (creates a hidden draft)
 * Check:        npm run check                                  (also runs before every build)
 * Images:       drop originals in assets-src/projects/<slug>/, run `npm run images`,
 *               then reference "/images/projects/<slug>/<file>.webp" below.
 * Field guide:  src/content/README.md
 *
 * Rules of the house: facts only (no invented metrics or links), and keep this file
 * self-contained (no imports), because the build checks read it directly.
 */

export type DiagramNode = {
  id: string;
  label: string;
  sub?: string;
  /** column (0 = leftmost) and row (default 0) on the diagram grid */
  col: number;
  row?: number;
  kind?: "actor" | "client" | "service" | "store" | "ai";
};
export type DiagramEdge = { from: string; to: string; label?: string; both?: boolean };
export type Diagram = {
  caption: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  boundary?: { label: string; ids: string[] };
};

export type ImageRef = {
  /** public URL, e.g. "/images/projects/skillsmatch/cover.webp" */
  src: string;
  /** describe the image for people who cannot see it */
  alt: string;
  caption?: string;
  /** "contain" (default for gallery) shows the whole image; "cover" fills the frame */
  fit?: "cover" | "contain";
};

export type Project = {
  /** URL part: lowercase letters, numbers and dashes. Changing it changes the page URL. */
  slug: string;
  title: string;
  /** one line under the title */
  subtitle: string;
  /** e.g. "2026" or "2024 — 2025" */
  year?: string;
  /** e.g. "Delivered", "Ongoing", "Internship project" */
  status: string;
  /** your role, shown in the facts column */
  role?: string;
  /** where / for whom, shown in the facts column */
  context?: string;
  /** 1-3 short keywords for the card */
  tags: string[];
  /** the main paragraph */
  summary: string;
  /** optional bullet points: what you did, concretely */
  highlights?: string[];
  stack: string[];
  /** big numbers; only real, verifiable ones */
  metrics?: { value: string; label: string }[];
  links?: { label: string; href: string }[];
  /** a real image for the card and the first gallery slide (screenshot, photo…) */
  cover?: ImageRef;
  /** extra images shown in the case-study gallery */
  gallery?: ImageRef[];
  /** no cover? a generated illustration named /figures/<figure>.svg is used (npm run figures) */
  figure?: string;
  figureAlt?: string;
  /** aspect ratio of the card on the home page, default "3 / 2" */
  ratio?: string;
  /** optional conceptual architecture diagram built from the stack */
  diagram?: Diagram;
  /** show on the home page grid (max 6); every project is always on /projects */
  featured: boolean;
  /** true = work in progress: hidden everywhere on the site */
  draft?: boolean;
};

const entries: Project[] = [
  {
    slug: "skillsmatch",
    title: "SkillsMatch",
    subtitle: "AI platform that recommends the optimal team for a client project",
    year: "2026",
    status: "Internship project",
    role: "Software Engineer Intern",
    context: "Capgemini Engineering, CasaNearshore (Casablanca)",
    tags: ["AI", "LLM / RAG", "Optimisation"],
    summary:
      "An internal AI platform built during an internship at Capgemini Engineering that recommends an optimal team for each client project. A FastAPI / React.js / PostgreSQL application exposes 12 REST routers and a 3-stage pipeline (role suggestion, candidate matching, team confirmation) shared by the web app and a conversational agent.",
    highlights: [
      "Hybrid CV pipeline (uploads, Gmail, LinkedIn): a local Keras classifier (OpenVINO / TensorFlow) categorises CVs before an LLM extracts skills and experience, limiting confidential data sent to external services.",
      "Semantic skill matching with ChromaDB embeddings: an exact match scores 1.0 and a near-match at cosine similarity ≥ 0.80 scores 0.5, avoiding brittle string matching such as “React.js” vs “ReactJS”.",
      "Team selection modelled with OR-Tools CP-SAT: maximises candidate scores under hard budget and headcount constraints for a provably optimal team, with automatic budget relaxation reported when infeasible.",
      "Secured with JWT (token revocation), RBAC and per-user Fernet-encrypted API keys; agent actions that modify data require explicit human approval.",
    ],
    stack: ["FastAPI", "React.js", "PostgreSQL", "ChromaDB", "OR-Tools", "TensorFlow", "LLM / RAG", "JWT"],
    metrics: [
      { value: "12", label: "REST routers" },
      { value: "3", label: "Pipeline stages" },
    ],
    figure: "skillsmatch",
    figureAlt: "Generated figure: roles on the left matched to candidates by similarity, beside a budget and headcount panel.",
    diagram: {
      caption: "Conceptual pipeline of the stated components",
      nodes: [
        { id: "sources", label: "CV sources", sub: "Uploads · Gmail · LinkedIn", col: 0, row: 0, kind: "actor" },
        { id: "classifier", label: "Keras classifier", sub: "Local · OpenVINO", col: 1, row: 0, kind: "ai" },
        { id: "llm", label: "LLM extraction", sub: "Skills · experience", col: 2, row: 0, kind: "ai" },
        { id: "chroma", label: "ChromaDB", sub: "Semantic matching", col: 3, row: 0, kind: "store" },
        { id: "solver", label: "OR-Tools CP-SAT", sub: "Optimal team", col: 3, row: 1, kind: "service" },
        { id: "api", label: "FastAPI", sub: "12 REST routers", col: 2, row: 1, kind: "service" },
        { id: "ui", label: "React + agent", sub: "Web app · chat", col: 1, row: 1, kind: "client" },
      ],
      edges: [
        { from: "sources", to: "classifier", label: "categorise" },
        { from: "classifier", to: "llm" },
        { from: "llm", to: "chroma", label: "skills" },
        { from: "chroma", to: "solver", label: "scores" },
        { from: "solver", to: "api", label: "team" },
        { from: "api", to: "ui", label: "pipeline", both: true },
      ],
    },
    featured: true,
  },
  {
    slug: "safetrack",
    title: "SafeTrack",
    subtitle: "AI-assisted undercarriage inspection for Al Boraq trains",
    year: "2025 — Ongoing",
    status: "Ongoing",
    role: "Backend and dashboard",
    context: "Team project for SIANA (Al Boraq high-speed rail)",
    tags: ["IoT", "Full-stack", "Docker"],
    summary:
      "A team project automating the undercarriage inspection of Al Boraq high-speed trains for SIANA, built around the Under-Train Inspection Robot. Arduino, ESP32 and Raspberry Pi hardware streams sensor data in real time to a FastAPI backend and a React.js dashboard.",
    highlights: [
      "Designed and implemented the containerised FastAPI backend (Docker Compose) and the React.js dashboard giving live visibility into the robot's sensor data.",
    ],
    stack: ["FastAPI", "Docker Compose", "React.js", "IoT", "Arduino", "ESP32", "Raspberry Pi"],
    figure: "safetrack",
    figureAlt: "Generated figure: converging rails with scan lines and three flagged detections.",
    diagram: {
      caption: "Conceptual data path of the stated stack",
      nodes: [
        { id: "sensors", label: "Robot sensors", sub: "Arduino · ESP32 · Pi", col: 0, kind: "actor" },
        { id: "api", label: "FastAPI", sub: "real-time", col: 1, kind: "service" },
        { id: "ui", label: "React", sub: "dashboard", col: 2, kind: "client" },
      ],
      edges: [
        { from: "sensors", to: "api", label: "readings" },
        { from: "api", to: "ui", label: "live data" },
      ],
      boundary: { label: "Docker Compose", ids: ["api", "ui"] },
    },
    featured: true,
  },
  {
    slug: "health-assistant",
    title: "AI Health Assistant",
    subtitle: "RAG medical assistant with real-time consultation chat",
    year: "2025",
    status: "Delivered",
    tags: ["AI", "RAG", "Real-time"],
    summary:
      "A medical web application with a RAG-based assistant and a real-time consultation chat (Socket.io), built on a secured microservices architecture.",
    stack: ["React.js", "Node.js", "PostgreSQL", "LLM", "RAG", "Socket.io", "JWT"],
    metrics: [
      { value: "87%", label: "Model accuracy" },
      { value: "4.2/5", label: "User satisfaction" },
    ],
    figure: "health-assistant",
    figureAlt: "Generated figure: chat bubbles beside a retrieval graph linking a query to documents and an answer.",
    diagram: {
      caption: "Conceptual architecture of the stated stack",
      nodes: [
        { id: "client", label: "React", sub: "client", col: 0, row: 0, kind: "client" },
        { id: "server", label: "Node.js", sub: "Socket.io · JWT", col: 1, row: 0, kind: "service" },
        { id: "db", label: "PostgreSQL", col: 2, row: 0, kind: "store" },
        { id: "rag", label: "RAG", sub: "retrieval", col: 1, row: 1, kind: "ai" },
        { id: "llm", label: "LLM", col: 2, row: 1, kind: "ai" },
      ],
      edges: [
        { from: "client", to: "server", label: "real-time", both: true },
        { from: "server", to: "db" },
        { from: "server", to: "rag" },
        { from: "rag", to: "llm" },
      ],
    },
    featured: true,
  },
  {
    slug: "mlops-emotion-detection",
    title: "MLOps Emotion Detection",
    subtitle: "Facial-emotion detection with tracked, repeatable releases",
    year: "2025 — 2026",
    status: "Delivered",
    tags: ["MLOps", "Computer vision", "Deep learning"],
    summary:
      "An end-to-end MLOps pipeline for an emotion-recognition model: training, model versioning and automated deployment, so every release is tracked and repeatable.",
    stack: ["Python", "TensorFlow", "OpenCV", "MLOps", "Deep learning"],
    figure: "mlops-emotion",
    figureAlt: "Generated figure: a facial landmark point cloud above a four-stage pipeline and a loss curve.",
    diagram: {
      caption: "Conceptual pipeline of the stated stages",
      nodes: [
        { id: "data", label: "Data", col: 0, kind: "store" },
        { id: "train", label: "Training", sub: "TensorFlow · OpenCV", col: 1, kind: "ai" },
        { id: "version", label: "Versioning", sub: "model registry", col: 2, kind: "store" },
        { id: "deploy", label: "Deployment", sub: "automated", col: 3, kind: "service" },
      ],
      edges: [
        { from: "data", to: "train" },
        { from: "train", to: "version" },
        { from: "version", to: "deploy" },
      ],
    },
    featured: true,
  },
  {
    slug: "ensam-campus-apps",
    title: "ENSAM Campus Apps",
    subtitle: "ReservENSAM & VoyageENSAM",
    year: "2024 — 2025",
    status: "Delivered",
    tags: ["Full-stack", "Campus", "Automation"],
    summary:
      "Two full-stack applications for student life at ENSAM. ReservENSAM removes the scheduling conflicts and manual errors from student clubs' room reservations; VoyageENSAM runs trip management end to end.",
    highlights: [
      "ReservENSAM: implemented a booking system that removed scheduling conflicts and manual errors for student clubs' room reservations.",
      "VoyageENSAM: built a full-stack trip-management platform covering payments and refunds, protected personal data, and transport and accommodation, with scanned trip tickets that log attendance at each checkpoint (departure, Station A, return).",
    ],
    // union of the CV's stack and the stack noted for ReservENSAM
    stack: ["Node.js", "Express.js", "React.js", "JWT", "MongoDB", "MySQL"],
    cover: {
      src: "/images/projects/ensam-campus-apps/reservensam-booking.webp",
      alt: "ReservENSAM booking page: a form to reserve a room next to the list of current reservations.",
      caption: "ReservENSAM: booking form (French interface)",
      fit: "cover",
    },
    gallery: [
      {
        src: "/images/projects/ensam-campus-apps/reservensam-calendar.webp",
        alt: "ReservENSAM calendar view: a monthly grid of reservations that can be filtered by room.",
        caption: "ReservENSAM: monthly calendar, filterable by room (French interface)",
      },
    ],
    diagram: {
      caption: "Conceptual flows of the two applications",
      nodes: [
        { id: "clubs", label: "Student clubs", col: 0, row: 0, kind: "actor" },
        { id: "reserv", label: "ReservENSAM", sub: "Room reservations", col: 1, row: 0, kind: "service" },
        { id: "slots", label: "Reservations", sub: "Conflict-free", col: 2, row: 0, kind: "store" },
        { id: "students", label: "Students", col: 0, row: 1, kind: "actor" },
        { id: "voyage", label: "VoyageENSAM", sub: "Trips · payments", col: 1, row: 1, kind: "service" },
        { id: "log", label: "Checkpoint log", sub: "Departure · Station A · Return", col: 2, row: 1, kind: "store" },
      ],
      edges: [
        { from: "clubs", to: "reserv", label: "request" },
        { from: "reserv", to: "slots" },
        { from: "students", to: "voyage", label: "book" },
        { from: "voyage", to: "log", label: "scan tickets" },
      ],
    },
    featured: true,
  },
  {
    slug: "pyramid",
    title: "Pyramid",
    subtitle: "Financial-transactions system, web and mobile",
    status: "Web + mobile",
    tags: ["Web", "Mobile", "Finance"],
    summary:
      "A system for managing financial transactions, delivered as a web application and as a mobile app. The web client is built with Java, FreeMarker and JavaScript; the mobile client with Flutter.",
    stack: ["Java", "FreeMarker", "JavaScript", "Flutter", "Dart"],
    links: [
      { label: "Web repository", href: "https://github.com/tahaprime/Pyramidj" },
      { label: "Mobile repository", href: "https://github.com/tahaprime/Pyramidmobile" },
    ],
    figure: "pyramid",
    figureAlt: "Generated figure: a stacked pyramid of horizontal layers beside a ledger and a phone outline.",
    diagram: {
      caption: "Conceptual shape: two clients, one domain",
      nodes: [
        { id: "web", label: "Web app", sub: "Java · FreeMarker", col: 0, row: 0, kind: "client" },
        { id: "mobile", label: "Mobile app", sub: "Flutter · Dart", col: 0, row: 1, kind: "client" },
        { id: "core", label: "Financial transactions", col: 1, row: 0, kind: "service" },
      ],
      edges: [
        { from: "web", to: "core" },
        { from: "mobile", to: "core" },
      ],
    },
    featured: true,
  },
  {
    slug: "medaccess",
    title: "MEDACCESS",
    subtitle: "Citizen healthcare-data platform",
    year: "2024",
    status: "Competition project",
    context: "Developed for DEVJEM (ENSIAS), where the project was selected and presented.",
    tags: ["Full-stack", "Security", "Competition"],
    summary:
      "A centralized healthcare-data platform for citizens, accessible to clinics and physicians and secured with JWT-based authentication.",
    stack: ["Node.js", "Express.js", "MongoDB", "EJS", "JWT"],
    figure: "medaccess",
    figureAlt: "Generated figure: a central cross-marked hub linked to clinic and physician nodes and a token chip.",
    diagram: {
      caption: "Conceptual access path of the stated stack",
      nodes: [
        { id: "users", label: "Citizens · clinics · physicians", col: 0, kind: "actor" },
        { id: "api", label: "Express.js", sub: "EJS · JWT", col: 1, kind: "service" },
        { id: "db", label: "MongoDB", col: 2, kind: "store" },
      ],
      edges: [
        { from: "users", to: "api", label: "authenticated" },
        { from: "api", to: "db" },
      ],
    },
    featured: false,
  },
  // <<< NEW PROJECTS ARE INSERTED ABOVE THIS LINE (npm run new:project) >>>
];

/** Every entry, drafts included: used by the build checks. */
export const allProjectEntries = entries;

/** Published projects with their automatic number (1, 2, 3…). */
export const projects = entries.filter((p) => !p.draft).map((p, i) => ({ ...p, index: i + 1 }));

export type PublishedProject = (typeof projects)[number];

export const featuredProjects = projects.filter((p) => p.featured).slice(0, 6);
export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);

/** The image used on cards and as the first slide: your own cover, else the generated figure. */
export function coverOf(p: Project): ImageRef & { generated: boolean } {
  if (p.cover) return { ...p.cover, generated: false };
  return { src: `/figures/${p.figure}.svg`, alt: p.figureAlt ?? "", generated: true };
}
