import { cn } from "@/lib/utils";
import React, { useState, useRef } from "react";

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  glowSize?: string;
}

export function InteractiveCard({
  children,
  className,
  glowColor = "rgba(var(--primary), 0.2)",
  glowSize = "70%",
}: InteractiveCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden rounded-lg shadow-sm transition-all duration-200",
        isHovering ? "shadow-md" : "",
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      {isHovering && (
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor} 0%, transparent ${glowSize})`,
          }}
        />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
} 