import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

/**
 * Register every GSAP plugin exactly once. Import from here, never from "gsap"
 * directly, so a component can never run a plugin that was not registered.
 * (SplitText / ScrambleText ship in the public npm package under GSAP's
 * Standard "no charge" licence.)
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, ScrambleTextPlugin);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, useGSAP, ScrollTrigger, SplitText };
