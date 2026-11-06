import type { Metadata } from "next";
import { projects } from "@/content/projects";
import { Reveal } from "@/components/fx/Reveal";
import { ProjectIndex } from "@/components/project/ProjectIndex";
import styles from "./projects.module.css";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected full-stack, IoT and AI projects by Taha Hoummadi: SafeTrack, AI Health Assistant, ReservENSAM, MLOps Emotion Detection, MEDACCESS and Pyramid.",
  alternates: { canonical: "/projects/" },
};

export default function ProjectsPage() {
  const count = String(projects.length).padStart(2, "0");
  return (
    <section className={`container ${styles.page}`} aria-labelledby="projects-title">
      <div className={styles.head}>
        <h1 id="projects-title" className="h2">
          <Reveal as="span" mode="scramble" hold={false}>
            Work
          </Reveal>{" "}
          <em>index.</em>
        </h1>
        <p className="mono eyebrow">
          <b>{count}</b> / Projects
        </p>
      </div>
      <ProjectIndex items={projects} />
    </section>
  );
}
