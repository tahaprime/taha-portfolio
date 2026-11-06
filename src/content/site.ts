/**
 * Site-wide facts. Source of truth: the owner's previous portfolio (tahableu.me),
 * github.com/tahaprime and the brief. Nothing here is invented; edit freely.
 */
export const site = {
  name: "Taha Hoummadi",
  firstName: "Taha",
  lastName: "Hoummadi",
  role: "Software Engineer",
  tagline: "I build systems, not just code.",
  positioning: "Full-stack · Backend · Intelligent systems",
  summary:
    "Engineering student in Software Engineering & Intelligent Systems. Building intelligent full-stack solutions with AI integration.",
  blurb:
    "I build systems, not just code: full-stack products, backend services and intelligent systems with AI integrated from the first line.",
  status: "Available for a PFA internship",
  school: { name: "ENSAM Meknès", track: "GI-ILSI", long: "Software Engineering & Intelligent Systems" },
  location: {
    country: "Morocco",
    city: "Meknès",
    // Decorative readout; Meknès city centre.
    lat: 33.8935,
    lon: -5.5473,
    timeZone: "Africa/Casablanca",
  },
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://tahableu.me",
  contact: {
    email: "tahahoummadi@gmail.com",
    github: "https://github.com/tahaprime",
    linkedin: "https://linkedin.com/in/taha-hoummadi",
  },
  languages: [
    { name: "Arabic", level: "Native" },
    { name: "French", level: "B2" },
    { name: "English", level: "B2" },
  ],
  about: [
    "I'm an engineering student at ENSAM Meknès, specializing in Software Engineering & Intelligent Systems (GI-ILSI). I'm passionate about building web applications and intelligent systems, and about integrating AI into practical solutions.",
    "My work spans real-time web applications with Laravel and React.js, MLOps pipelines for facial-emotion detection with TensorFlow and OpenCV, and IoT projects that connect Arduino sensors to FastAPI backends, containerized with Docker Compose.",
    "I'm now looking for a final-year internship (PFA) where I can apply and deepen these skills in a stimulating professional environment.",
  ],
  // Figures carried over from the previous portfolio: confirm before publishing.
  stats: [
    { value: "3+", label: "Years coding" },
    { value: "5+", label: "AI projects" },
    { value: "10+", label: "Full-stack projects" },
  ],
} as const;

export const nav = [
  { label: "Work", href: "/projects/", badge: true },
  { label: "About", href: "/#about" },
  { label: "Journey", href: "/#journey" },
] as const;

export const socials = [
  { label: "GitHub", href: site.contact.github },
  { label: "LinkedIn", href: site.contact.linkedin },
] as const;
