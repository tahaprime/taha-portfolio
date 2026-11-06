import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "lenis/dist/lenis.css";
import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/type.css";
import "@/styles/layout.css";
import { site } from "@/content/site";
import { getCvHref } from "@/lib/cv";
import { MotionProvider } from "@/components/shell/MotionProvider";
import { SmoothScroll } from "@/components/shell/SmoothScroll";
import { Loader } from "@/components/shell/Loader";
import { Header } from "@/components/shell/Header";
import { Footer } from "@/components/shell/Footer";

// Open-license (OFL) families, self-hosted at build time by next/font: no runtime Google requests.
// Only what the design uses: one subset, the width axis (condensed display), italic serif, one mono weight.
const sans = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-sans",
  display: "swap",
});
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic"],
  variable: "--font-serif",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mono",
  display: "swap",
});

const title = `${site.name}: ${site.summary}`;
const description = `${site.summary} ${site.status}.`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s — ${site.name}` },
  description,
  authors: [{ name: site.name, url: site.url }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title,
    description,
    url: "/",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#edeae2" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0e10" },
  ],
};

/**
 * Runs before first paint (blocking, tiny):
 *  1. resolves the theme: stored choice > system preference > light
 *  2. opens the animation gate ONLY when motion is allowed, and decides whether the
 *     once-per-session loader shows. No JS / reduced motion => everything is visible.
 *  3. failsafe: if the app has not hydrated after 9s, drop the gate so nothing stays hidden.
 */
const BOOT = `(function(){try{var d=document.documentElement,s=null;try{s=localStorage.getItem("theme")}catch(e){}
var t=(s==="dark"||s==="light")?s:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");d.dataset.theme=t;
if(matchMedia("(prefers-reduced-motion: no-preference)").matches){d.classList.add("js-motion");var b=null;try{b=sessionStorage.getItem("boot")}catch(e){}if(!b)d.classList.add("show-loader")}
setTimeout(function(){if(!window.__ready){d.classList.remove("js-motion","show-loader")}},9000)}catch(e){}})();`;

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: site.url,
  jobTitle: "Software Engineering student",
  description: site.summary,
  alumniOf: { "@type": "CollegeOrUniversity", name: site.school.name },
  email: `mailto:${site.contact.email}`,
  sameAs: [site.contact.github, site.contact.linkedin],
  knowsAbout: ["Full-stack development", "Software architecture", "Machine learning", "MLOps", "Backend engineering", "Docker"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${sans.variable} ${serif.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <MotionProvider>
          <SmoothScroll />
          <Loader />
          <Header />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer cvHref={getCvHref()} />
        </MotionProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      </body>
    </html>
  );
}
