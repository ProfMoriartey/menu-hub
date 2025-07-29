// components/visuals/MouseTracker.tsx
"use client";

import { useState, useEffect } from "react";

export default function MouseTracker() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [trackerColor, setTrackerColor] = useState("rgba(255, 0, 0, 0.2)");

  useEffect(() => {
    // Add MouseEvent type annotation here
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
      const hue = (event.clientX / window.innerWidth) * 360;
      setTrackerColor(`hsla(${hue}, 70%, 50%, 0.2)`);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "130px",
        height: "130px",
        borderRadius: "50%",
        backgroundColor: trackerColor,
        filter: "blur(20px)",
        pointerEvents: "none",
        transform: `translate(${mousePosition.x - 52}px, ${mousePosition.y - 52}px)`,
        transition: "background-color 0.1s ease-out",
        zIndex: 9999,
      }}
    />
  );
}
