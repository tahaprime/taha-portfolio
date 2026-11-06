import type { Metadata } from "next";
import { Reveal } from "@/components/fx/Reveal";
import { TransitionLink } from "@/components/shell/TransitionLink";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="container nf-page" aria-labelledby="nf-title">
      <p className="mono eyebrow">
        <b>404</b> / Route not found
      </p>
      <h1 id="nf-title" className="display nf-code">
        <Reveal as="span" mode="scramble" hold={false}>
          404
        </Reveal>
      </h1>
      <p className="serif nf-line">This page isn’t in the repository.</p>
      <TransitionLink href="/" className="nf-home">
        <span aria-hidden="true">←</span> Back to the home page
      </TransitionLink>
    </section>
  );
}
