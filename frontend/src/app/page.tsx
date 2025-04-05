"use client";
import dynamic from "next/dynamic";
const Hero = dynamic(() => import("../components/hero"), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center">
      <p>Loading...</p>
    </div>
  ),
});

export default function Home() {
  return (
    <main>
      <Hero />
    </main>
  );
}
