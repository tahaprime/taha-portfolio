/**
 * PROFILE & SITE-WIDE TEXT: edit this file to change who you are, what you are looking
 * for, how to reach you, your photo and the About copy. See src/content/README.md.
 * Keep this file self-contained (no imports): the build checks read it directly.
 */

// What you are looking for. These fields feed the hero pill, the footer, the About text
// and the page descriptions, so you only change them here.
const availability = {
  kind: "PFE internship",
  duration: "3 to 6 months",
  start: "February 2027",
  focus: "AI/ML or backend engineering",
};

export const site = {
  name: "Taha Hoummadi",
  firstName: "Taha",
  lastName: "Hoummadi",
  role: "Software Engineer",
  tagline: "I build systems, not just code.",
  positioning: "AI & Intelligent Systems · Backend / Full-Stack Development",
  summary:
    "Software engineering student at ENSAM Meknès (Intelligent Systems), building AI-powered applications with LLM/RAG, optimisation and full-stack development.",
  blurb:
    "I build systems, not just code: AI-powered applications with LLM/RAG and optimisation, on solid backend and full-stack foundations.",
  availability,
  /** One line used in the hero pill, footer and meta description. */
  status: `Seeking a ${availability.kind} · ${availability.duration} · from ${availability.start}`,
  school: { name: "ENSAM Meknès", track: "GI-ILSI", long: "Software Engineering & Intelligent Systems" },
  location: {
    country: "Morocco",
    city: "Meknès",
    // Decorative readout in the hero (Meknès city centre).
    lat: 33.8935,
    lon: -5.5473,
    timeZone: "Africa/Casablanca",
  },
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://tahableu.me",
  contact: {
    email: "tahahoummadi@gmail.com",
    github: "https://github.com/tahaprime",
    linkedin: "https://linkedin.com/in/taha-hoummadi-bleu",
  },
  languages: [
    { name: "Arabic", level: "Native" },
    { name: "French", level: "B2" },
    { name: "English", level: "B2" },
  ],
  /**
   * Your photo. Put the original in assets-src/ (e.g. assets-src/profile.jpg), run
   * `npm run images`, and point `src` at the result.
   * treatment: "mono" = tonal black & white to match the design, "color" = original colours.
   * position: CSS object-position used when the frame crops the photo.
   */
  portrait: {
    src: "/images/profile.webp",
    alt: "Portrait of Taha Hoummadi",
    treatment: "mono" as "mono" | "color",
    position: "50% 25%",
  },
  /** About section paragraphs, one string each. */
  about: [
    "I'm a software engineering student at ENSAM Meknès (GI-ILSI, Intelligent Systems), building AI-powered applications with LLM/RAG, optimisation and full-stack development.",
    "At Capgemini Engineering (CasaNearshore) I architected SkillsMatch, an internal AI platform that recommends the optimal team for client projects: FastAPI, React, PostgreSQL, ChromaDB and OR-Tools, secured with JWT, RBAC and human approval for any agent action that changes data. Before that: a real-time correspondence platform with Laravel at SRM Oujda, an MLOps pipeline for emotion recognition, and the dashboard of an IoT inspection robot for Al Boraq trains.",
    `I'm now looking for a ${availability.kind} of ${availability.duration}, starting ${availability.start}, in ${availability.focus}.`,
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
