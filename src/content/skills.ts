/**
 * SKILLS: groups shown in the Capabilities ledger. Add, remove or rename freely;
 * the counter next to each group is automatic. (Mirrors the Technical Skills of the CV.)
 */
export const skillGroups = [
  { name: "Languages", items: ["Python", "C++", "Java", "JavaScript", "PHP", "Dart"] },
  { name: "Backend & APIs", items: ["FastAPI", "Node.js", "Express.js", "Laravel", "REST", "JWT / RBAC", "OpenAPI"] },
  { name: "Frontend", items: ["React.js", "HTML/CSS", "TailwindCSS"] },
  { name: "AI / ML", items: ["LLM / RAG", "TensorFlow", "Scikit-learn", "OpenCV", "YOLOv8", "ChromaDB"] },
  { name: "Data & Optimization", items: ["PostgreSQL", "MySQL", "MongoDB", "Pandas", "OR-Tools"] },
  { name: "DevOps / IoT", items: ["Docker", "Docker Compose", "Git", "ESP32", "Arduino", "Raspberry Pi"] },
] as const;
