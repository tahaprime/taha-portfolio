/**
 * EXPERIENCE, EDUCATION, COMPETITIONS: three lists, newest first. Each entry is a block of
 * fields; copy one, edit it, done. See src/content/README.md for the field guide.
 * `projectSlug` (optional) links an experience to one of your project case studies.
 */
export const experience = [
  {
    role: "Software Engineer Intern",
    org: "Capgemini Engineering",
    unit: "CasaNearshore, Casablanca",
    period: "2026",
    stack: ["FastAPI", "React.js", "PostgreSQL", "ChromaDB", "OR-Tools", "TensorFlow", "LLM / RAG", "JWT"],
    points: [
      "Architected SkillsMatch, an internal AI platform that recommends an optimal team for client projects: FastAPI / React.js / PostgreSQL, 12 REST routers and a 3-stage pipeline (role suggestion, candidate matching, team confirmation) shared by the web app and a conversational agent.",
      "Designed a hybrid CV pipeline (uploads, Gmail, LinkedIn): a local Keras classifier (OpenVINO / TensorFlow) categorises CVs before an LLM extracts skills and experience, limiting confidential data sent to external services.",
      "Implemented semantic skill matching with ChromaDB embeddings (exact match 1.0, near-match at cosine similarity ≥ 0.80 scored 0.5), avoiding brittle string matching such as “React.js” vs “ReactJS”.",
      "Modelled team selection with OR-Tools CP-SAT: maximises candidate scores under hard budget and headcount constraints for a provably optimal team, with automatic budget relaxation reported when infeasible.",
      "Secured the platform with JWT (token revocation), RBAC and per-user Fernet-encrypted API keys; agent actions that modify data require explicit human approval.",
    ],
    projectSlug: "skillsmatch",
  },
  {
    role: "Web Developer Intern",
    org: "SRM Oujda",
    unit: "Société Régionale Multiservices, IT Department",
    period: "2025",
    stack: ["PHP", "Laravel", "MySQL", "JavaScript", "HTML/CSS"],
    points: [
      "Developed a real-time web application to manage correspondence between company departments and external partners, with mail status tracking, email notifications and an interactive interface.",
    ],
  },
] as const;

export const education = [
  {
    title: "Engineering degree: Software Engineering & Intelligent Systems (GI-ILSI)",
    org: "ENSAM Meknès",
    period: "2024 — Present",
    status: "Ongoing",
  },
  {
    title: "Integrated Preparatory Program",
    org: "ENSAM Meknès",
    period: "2022 — 2024",
    status: "Completed",
  },
  {
    title: "Baccalaureate: Mathematical Sciences A",
    org: "Oued Eddahab High School, Oujda",
    period: "2022",
    status: "Completed",
  },
] as const;

export const competitions = [
  {
    title: "RALLY-AI Future LAB",
    org: "Ministry of Digital Transition · Merzouga",
    period: "Jun 2026",
    detail:
      "National hackathon: built a smart tourism mobile app (budget manager, holiday planner, automated booking) to help travellers discover Morocco's hidden places.",
  },
  {
    title: "Agri-Food Hackathon",
    org: "Ministry of Agriculture · AGRINOVA",
    period: "Apr 2026",
    detail: "National hackathon (Smart Farming, Smart Food): developed digital solutions for the agri-food sector.",
  },
  {
    title: "DEVJEM",
    org: "ENSIAS",
    period: "2024",
    detail: "Inter-school software development competition. The MEDACCESS project was selected and presented.",
  },
] as const;
