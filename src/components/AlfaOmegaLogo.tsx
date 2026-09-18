import React from 'react';

interface AlfaOmegaLogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'icon' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const AlfaOmegaLogo: React.FC<AlfaOmegaLogoProps> = ({
  className = '',
  variant = 'compact',
  size = 'md',
  showText = true,
}) => {
  // Dimension mappings
  const sizeStyles = {
    sm: { height: 28, text: 'text-sm', badge: 'text-[9px] px-1.5 py-0.5' },
    md: { height: 38, text: 'text-base sm:text-lg', badge: 'text-[10px] px-2 py-0.5' },
    lg: { height: 50, text: 'text-xl sm:text-2xl', badge: 'text-xs px-2.5 py-1' },
    xl: { height: 72, text: 'text-3xl sm:text-4xl', badge: 'text-sm px-3 py-1' },
  }[size];

  // Pure SVG Emblem based exactly on the Alfa & Omega Gym insignia
  const SvgEmblem = ({ height = sizeStyles.height }: { height?: number }) => (
    <svg
      viewBox="0 0 540 340"
      height={height}
      className="shrink-0 aspect-[540/340] select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="aoGymGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* LEFT: Red Greek Alpha Loop (α) */}
      <g>
        <path
          d="M 195 95 
             C 170 50, 95 50, 60 95 
             C 25 140, 25 210, 60 255 
             C 95 300, 170 300, 205 250 
             L 260 320
             C 268 330, 282 324, 277 314
             L 225 242
             C 245 195, 235 135, 195 95 Z"
          fill="#DC2626"
        />
        {/* Inner white disk */}
        <circle cx="128" cy="175" r="66" fill="#FFFFFF" />
        {/* Text "ALFA" inside circle */}
        <text
          x="128"
          y="187"
          fontFamily="'Montserrat', 'Arial Black', -apple-system, sans-serif"
          fontSize="40"
          fontWeight="900"
          letterSpacing="2"
          fill="#71717A"
          textAnchor="middle"
        >
          ALFA
        </text>
      </g>

      {/* CENTER: Red Ampersand (&) */}
      <text
        x="270"
        y="198"
        fontFamily="'Montserrat', 'Arial Black', -apple-system, sans-serif"
        fontSize="110"
        fontWeight="900"
        fill="#DC2626"
        textAnchor="middle"
      >
        &amp;
      </text>

      {/* RIGHT: Gray Greek Omega Arch (Ω) */}
      <g transform="translate(-40, 0)">
        <path
          d="M 330 290 
             L 380 290 
             C 360 250, 350 215, 355 170 
             C 365 105, 420 60, 480 60 
             C 540 60, 595 105, 605 170 
             C 610 215, 600 250, 580 290 
             L 630 290
             C 638 290, 640 308, 630 308
             L 560 308
             C 545 308, 538 295, 546 275
             C 564 240, 572 205, 568 170
             C 558 120, 520 95, 480 95
             C 440 95, 402 120, 392 170
             C 388 205, 396 240, 414 275
             C 422 295, 415 308, 400 308
             L 330 308
             C 320 308, 320 290, 330 290 Z"
          fill="#8E99A8"
        />
        {/* Inner white background arch disk */}
        <circle cx="480" cy="175" r="62" fill="#FFFFFF" />
        {/* Text "OMEGA" inside arch */}
        <text
          x="480"
          y="186"
          fontFamily="'Montserrat', 'Arial Black', -apple-system, sans-serif"
          fontSize="34"
          fontWeight="900"
          letterSpacing="1"
          fill="#DC2626"
          textAnchor="middle"
        >
          OMEGA
        </text>
      </g>

      {/* FOREGROUND: Slanted "GYM" in bold athletic font */}
      <g filter="url(#aoGymGlow)">
        {/* White outer stroke outline */}
        <text
          x="270"
          y="325"
          fontFamily="'Montserrat', 'Arial Black', Impact, sans-serif"
          fontSize="115"
          fontWeight="900"
          fontStyle="italic"
          letterSpacing="6"
          fill="#09090B"
          stroke="#FFFFFF"
          strokeWidth="18"
          strokeLinejoin="round"
          strokeLinecap="round"
          textAnchor="middle"
        >
          GYM
        </text>
        {/* Red accent stroke */}
        <text
          x="270"
          y="325"
          fontFamily="'Montserrat', 'Arial Black', Impact, sans-serif"
          fontSize="115"
          fontWeight="900"
          fontStyle="italic"
          letterSpacing="6"
          fill="none"
          stroke="#DC2626"
          strokeWidth="4"
          strokeLinejoin="round"
          textAnchor="middle"
        >
          GYM
        </text>
        {/* Black athletic solid text */}
        <text
          x="270"
          y="325"
          fontFamily="'Montserrat', 'Arial Black', Impact, sans-serif"
          fontSize="115"
          fontWeight="900"
          fontStyle="italic"
          letterSpacing="6"
          fill="#09090B"
          textAnchor="middle"
        >
          GYM
        </text>
      </g>
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <SvgEmblem height={sizeStyles.height} />
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center gap-2 text-center ${className}`}>
        <div className="p-2.5 bg-white/95 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200/80 inline-flex items-center justify-center">
          <SvgEmblem height={sizeStyles.height * 1.5} />
        </div>
        {showText && (
          <div className="space-y-0.5">
            <h1 className={`font-black tracking-tight text-slate-900 font-['Space_Grotesk'] ${sizeStyles.text}`}>
              ALFA <span className="text-red-600">&amp;</span> OMEGA
            </h1>
            <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-slate-900 bg-red-100/90 text-red-700 px-3 py-0.5 rounded-full border border-red-200">
              GIMNASIO &amp; FITNESS
            </span>
          </div>
        )}
      </div>
    );
  }

  // Default 'compact' brand header (used in Navbar and card headers)
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      {/* Insignia Emblem inside a crisp high-contrast container */}
      <div className="h-10 sm:h-11 px-1.5 bg-white rounded-xl shadow-md border border-slate-200/80 flex items-center justify-center shrink-0">
        <SvgEmblem height={size === 'sm' ? 24 : 32} />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-white font-['Space_Grotesk'] ${sizeStyles.text}`}>
              ALFA <span className="text-red-500 font-black">&amp;</span> OMEGA
            </span>
            <span className={`font-black uppercase tracking-wider bg-red-600 text-white rounded-md shadow-xs ${sizeStyles.badge}`}>
              GYM
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-0.5">
            Gimnasio Oficial
          </span>
        </div>
      )}
    </div>
  );
};
