/**
 * Projects. Facts come from tahableu.me and github.com/tahaprime. Anything not
 * stated there (links, results, years) is intentionally left out rather than
 * invented. `diagram` is a conceptual illustration of the stated stack, never a
 * screenshot. SkillsMatch and CodePoster join this list once details exist.
 */
export type DiagramNode = {
  id: string;
  label: string;
  sub?: string;
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

export type Project = {
  slug: string;
  index: number;
  title: string;
  subtitle: string;
  year?: string;
  status: string;
  tags: string[];
  summary: string;
  context?: string;
  stack: string[];
  metrics?: { value: string; label: string }[];
  links?: { label: string; href: string }[];
  /** file name (without extension) in /public/figures */
  figure: string;
  figureAlt: string;
  diagram: Diagram;
  featured: boolean;
};

export const projects: Project[] = [
  {
    slug: "safetrack",
    index: 1,
    title: "SafeTrack",
    subtitle: "AI-assisted autonomous railway inspection",
    status: "Ongoing",
    tags: ["IoT", "Full-stack", "Docker"],
    summary:
      "An autonomous robot that inspects the undercarriage of Al Boraq high-speed trains, built for SIANA. Arduino microcontrollers and IoT sensors stream data in real time to a FastAPI backend and a React interface, packaged with Docker Compose.",
    context: "Built for SIANA",
    stack: ["FastAPI", "Docker Compose", "React.js", "Arduino", "IoT sensors"],
    figure: "safetrack",
    figureAlt: "Generated figure: converging rails with scan lines and three flagged detections.",
    diagram: {
      caption: "Conceptual data path of the stated stack",
      nodes: [
        { id: "sensors", label: "Sensors", sub: "Arduino · IoT", col: 0, kind: "actor" },
        { id: "api", label: "FastAPI", sub: "real-time", col: 1, kind: "service" },
        { id: "ui", label: "React", sub: "interface", col: 2, kind: "client" },
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
    index: 2,
    title: "AI Health Assistant",
    subtitle: "RAG medical assistant with real-time messaging",
    year: "2025",
    status: "Delivered",
    tags: ["AI", "RAG", "Real-time"],
    summary:
      "A full-stack web application that integrates an AI-powered medical assistant based on retrieval-augmented generation (RAG), with real-time messaging over Socket.io for health monitoring and medical consultation.",
    stack: ["React.js", "Node.js", "PostgreSQL", "LLM", "RAG", "Socket.io", "JWT"],
    // As published on the previous portfolio: confirm before publishing.
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
    slug: "reservensam",
    index: 3,
    title: "ReservENSAM",
    subtitle: "Room reservations for ENSAM student clubs",
    year: "2024–2025",
    status: "Delivered",
    tags: ["Full-stack", "Automation"],
    summary:
      "A web application that automates room reservations for the student clubs of ENSAM, removing the scheduling conflicts and errors that came with the manual process.",
    stack: ["Node.js", "MySQL"],
    figure: "reservensam",
    figureAlt: "Generated figure: a weekly booking matrix with reserved blocks and one conflict-free slot outlined.",
    diagram: {
      caption: "Conceptual flow of the stated stack",
      nodes: [
        { id: "clubs", label: "Student clubs", col: 0, kind: "actor" },
        { id: "app", label: "Node.js", sub: "web app", col: 1, kind: "service" },
        { id: "db", label: "MySQL", sub: "reservations", col: 2, kind: "store" },
      ],
      edges: [
        { from: "clubs", to: "app", label: "request a room" },
        { from: "app", to: "db", label: "store" },
      ],
    },
    featured: true,
  },
  {
    slug: "mlops-emotion-detection",
    index: 4,
    title: "MLOps Emotion Detection",
    subtitle: "Facial-emotion detection with an MLOps pipeline",
    year: "2025–2026",
    status: "Delivered",
    tags: ["MLOps", "Computer vision", "Deep learning"],
    summary:
      "A complete facial-emotion-detection system with an MLOps pipeline covering training, model versioning and automated deployment, built with TensorFlow and OpenCV.",
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
    slug: "medaccess",
    index: 5,
    title: "MEDACCESS",
    subtitle: "Citizen healthcare-data platform",
    year: "2024",
    status: "Competition project",
    tags: ["Full-stack", "Security", "Competition"],
    summary:
      "A centralized healthcare-data platform for citizens, accessible to clinics and physicians and secured with JWT-based authentication.",
    context: "Developed for DEVJEM (ENSIAS), where the project was selected and presented.",
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
    featured: true,
  },
  {
    slug: "pyramid",
    index: 6,
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
];

export const featuredProjects = projects.filter((p) => p.featured);
export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
