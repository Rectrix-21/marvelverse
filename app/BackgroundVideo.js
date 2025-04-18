"use client";

import { useEffect, useState } from "react";
import { setBackgroundVideo } from "../lib/backgroundVideo";

export default function BackgroundVideo() {
  // Initially, use full black as the overlay.
  const [overlayColor, setOverlayColor] = useState("rgba(0, 0, 0, 1)");

  useEffect(() => {
    setBackgroundVideo();
  }, []);

  const handleVideoLoaded = () => {
    // When video data is loaded, crossfade to a lighter overlay
    setOverlayColor("rgba(0, 0, 0, 0.65)");
  };

  return (
    <>
      <video
        autoPlay
        loop
        muted
        playsInline // ← allow inline play on iOS
        webkit-playsinline="true" // ← legacy iOS
        preload="auto"
        id="bgVideo"
        onLoadedData={handleVideoLoaded}
        style={{
          position: "fixed",
          zIndex: -2,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(2px)",
        }}
      >
        <source id="bgVideoSource" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
          background: overlayColor,
          transition: "background 1s ease", // Crossfade transition
        }}
      />
    </>
  );
}
