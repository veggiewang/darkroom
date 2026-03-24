
interface CanisterProps {
  brandColorStart?: string;
  brandColorEnd?: string;
  textColor?: string;
  iso?: string | number;
  className?: string;
}

export function VectorFilmCanister({ 
  brandColorStart = '#FFB000', 
  brandColorEnd = '#E03000', 
  textColor = '#ffffff',
  iso = '400',
  className = ''
}: CanisterProps) {
  // A unique ID so gradients don't clash when multiple are rendered
  const gradId = `grad-${brandColorStart.replace('#','')}-${brandColorEnd.replace('#','')}`;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className} fill="none">
      {/* 3D Drop Shadow */}
      <ellipse cx="50" cy="85" rx="30" ry="10" fill="rgba(0,0,0,0.5)" filter="blur(4px)" />

      {/* Main Body */}
      <rect x="25" y="20" width="50" height="60" rx="2" fill="#1e1e1e" />
      
      {/* Extruding Lip */}
      <path d="M73 35 L82 37 L82 63 L73 65 Z" fill="#111" />
      
      {/* Film Strip peeking out */}
      <path d="M82 38 L95 40 L95 60 L82 62 Z" fill="#6d4c41" opacity="0.9" />
      {/* Spockets */}
      <rect x="85" y="42" width="3" height="3" fill="#111" transform="skewY(10)" />
      <rect x="85" y="48" width="3" height="3" fill="#111" transform="skewY(10)" />
      <rect x="85" y="54" width="3" height="3" fill="#111" transform="skewY(10)" />

      {/* Brand Label Area */}
      <rect x="25" y="32" width="50" height="36" fill={`url(#${gradId})`} />
      
      {/* Label Text */}
      <text x="50" y="54" fontFamily="Impact, monospace" fontSize="11" fontWeight="bold" fill={textColor} textAnchor="middle" letterSpacing="1">
        ISO {iso}
      </text>

      {/* Lighting/Reflection (Shiny curved plastic/metal) */}
      <rect x="30" y="20" width="4" height="60" fill="white" opacity="0.15" />
      <rect x="65" y="20" width="6" height="60" fill="black" opacity="0.3" />

      {/* Top Cap */}
      <ellipse cx="50" cy="20" rx="25" ry="7" fill="#d4d4d4" />
      <ellipse cx="50" cy="18" rx="23" ry="5" fill="#f0f0f0" />
      <ellipse cx="50" cy="18" rx="15" ry="3" fill="#b0b0b0" />
      {/* Nipple */}
      <rect x="44" y="10" width="12" height="8" fill="#c0c0c0" />
      <ellipse cx="50" cy="10" rx="6" ry="2" fill="#e0e0e0" />

      {/* Bottom Cap */}
      <ellipse cx="50" cy="80" rx="25" ry="7" fill="#c0c0c0" />
      <path d="M25 80 Q 50 87 75 80 L 75 78 Q 50 85 25 78 Z" fill="#999" />
      
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={brandColorStart} />
          <stop offset="100%" stopColor={brandColorEnd} />
        </linearGradient>
      </defs>
    </svg>
  );
}
