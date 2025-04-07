"use client";

import dynamic from "next/dynamic";

// Dynamically import the Quiz component from mcu/page.js
const Quiz = dynamic(() => import("./mcu/page.js"), { ssr: false });

export default function Home() {
  return <Quiz />;
}