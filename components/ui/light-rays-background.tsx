import React from 'react';

export const LightRaysBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Dark gradient base with better contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950"></div>
      
      {/* Light rays - more visible on dark background */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 left-1/2 w-[3px] h-full origin-top"
            style={{
              background: `linear-gradient(to bottom, 
                rgba(99, 179, 237, 0.3) 0%, 
                rgba(168, 85, 247, 0.25) 50%, 
                transparent 100%)`,
              transform: `rotate(${(i * 30) - 90}deg) translateX(-50%)`,
              animation: `pulse ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
              opacity: 0.4,
            }}
          />
        ))}
      </div>

      {/* Glowing orbs - enhanced for dark theme */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-float delay-1000"></div>
      <div className="absolute bottom-20 left-1/3 w-[450px] h-[450px] bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-18 animate-float delay-500"></div>
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-12 animate-float delay-300"></div>
      
      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(139, 92, 246, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
      
      {/* Vignette effect for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-slate-950/50"></div>
    </div>
  );
};
