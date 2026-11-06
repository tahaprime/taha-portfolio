import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Work } from "@/components/sections/Work";
import { Capabilities } from "@/components/sections/Capabilities";
import { Journey } from "@/components/sections/Journey";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Work />
      <Capabilities />
      <Journey />
    </>
  );
}
