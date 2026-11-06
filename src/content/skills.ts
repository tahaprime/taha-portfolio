/** Skill groups. Sources: tahableu.me, the GitHub profile README and repository languages. */
export const skillGroups = [
  { name: "Languages", items: ["C++", "Python", "JavaScript", "TypeScript", "Java", "PHP", "Dart", "HTML/CSS"] },
  {
    name: "Frameworks",
    items: ["React.js", "Next.js", "Node.js", "Express.js", "Laravel", "FastAPI", "Spring Boot", "Flutter", "Socket.io"],
  },
  { name: "AI & ML", items: ["LLM / RAG", "TensorFlow", "Scikit-learn", "Pandas", "OpenCV", "YOLOv8"] },
  { name: "DevOps & IoT", items: ["Docker", "Docker Compose", "Arduino", "IoT", "MLOps"] },
  { name: "Databases", items: ["MySQL", "PostgreSQL", "OracleXE", "MongoDB"] },
  { name: "Tools", items: ["Git", "VS Code", "Figma", "Postman", "JWT", "Linux"] },
] as const;
