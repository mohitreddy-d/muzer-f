import React from "react";

export function BackgroundGradient({ children, className = "", containerClassName = "", ...props }: { 
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <div className={`relative ${containerClassName}`} {...props}>
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-500/20 via-blue-500/20 to-red-500/20 
        [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]" />
      <div className="absolute inset-[-2px] rounded-lg bg-white/80 dark:bg-black/80 blur" />
      <div className="absolute inset-0 rounded-lg opacity-20 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]" />
      <div className={`relative ${className}`}>
        {children}
      </div>
    </div>
  );
}

export function BackgroundBeams({ className }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <div className="h-full w-full bg-[linear-gradient(to_right,transparent,rgb(255,255,255),transparent)] dark:bg-[linear-gradient(to_right,transparent,rgb(0,0,0),transparent)] opacity-20"></div>
      <div className="absolute -left-[100%] top-[0%] right-0 -z-10 h-[1000px] w-[200%] -rotate-12 transform-gpu bg-red-500/10 opacity-30 blur-[60px]"></div>
      <div className="absolute -left-[100%] top-[20%] right-0 -z-10 h-[1000px] w-[200%] rotate-12 transform-gpu bg-red-500/10 opacity-30 blur-[60px]"></div>
      <div className="absolute -left-[100%] top-[40%] right-0 -z-10 h-[300px] w-[200%] -rotate-[30deg] transform-gpu bg-blue-500/10 opacity-40 blur-[60px]"></div>
      <div className="absolute -left-[100%] top-[60%] right-0 -z-10 h-[300px] w-[200%] rotate-[30deg] transform-gpu bg-blue-500/10 opacity-40 blur-[60px]"></div>
    </div>
  );
}

export function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute left-[10%] top-[20%] h-24 w-24 rounded-full bg-red-500/10 blur-xl animate-float"></div>
      <div className="absolute right-[15%] top-[30%] h-16 w-16 rounded-full bg-blue-500/10 blur-xl animate-float animation-delay-1000"></div>
      <div className="absolute left-[20%] top-[60%] h-32 w-32 rounded-full bg-red-500/10 blur-xl animate-float animation-delay-2000"></div>
      <div className="absolute right-[25%] top-[70%] h-20 w-20 rounded-full bg-blue-500/10 blur-xl animate-float animation-delay-3000"></div>
    </div>
  );
} 