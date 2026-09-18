import React from 'react';

interface KiddoMascotProps {
  mood?: 'happy' | 'encouraging' | 'thinking' | 'cheer' | 'oops';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withCap?: boolean;
}

export const KiddoMascot: React.FC<KiddoMascotProps> = ({
  mood = 'encouraging',
  size = 'md',
  className = '',
  withCap = true,
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  };

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${sizeClasses[size]} ${className}`}>
      {/* Soft ambient glow halo */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#5BA7FF]/30 to-[#A99CFB]/40 rounded-full blur-xl animate-pulse pointer-events-none" />

      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-md transition-transform duration-300 hover:scale-105"
      >
        {/* Shadow under mascot */}
        <ellipse cx="80" cy="148" rx="42" ry="6" fill="#BFDBFE" opacity="0.6" />

        {/* Graduation Cap or Magic Sparkle */}
        {withCap ? (
          <g className="transition-transform duration-300">
            {/* Graduation mortarboard cap in gentle purple */}
            <path
              d="M80 14L120 28L80 42L40 28L80 14Z"
              fill="#5E51AA"
              stroke="#3C2E87"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Cap bottom skullcap */}
            <path
              d="M58 34V46C58 52 102 52 102 46V34"
              fill="#463991"
              stroke="#3C2E87"
              strokeWidth="2"
            />
            {/* Tassel */}
            <path
              d="M80 28V36C80 42 114 44 116 52"
              stroke="#FFD65A"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="116" cy="53" r="3.5" fill="#FFD65A" />
            <circle cx="80" cy="28" r="3" fill="#FFD65A" />
          </g>
        ) : (
          <g>
            {/* Magic sparkle star on top */}
            <circle cx="80" cy="18" r="7" fill="#FFD65A" />
            <path d="M80 25V33" stroke="#FFD65A" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {/* Main Body - Cheerful Waterdrop in Blue & Mint gradient */}
        <defs>
          <linearGradient id="bodyGrad" x1="40" y1="26" x2="120" y2="144" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#68D5B5" />
            <stop offset="35%" stopColor="#5BA7FF" />
            <stop offset="100%" stopColor="#4F8EE6" />
          </linearGradient>
          <linearGradient id="faceGrad" x1="80" y1="68" x2="80" y2="132" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F4F8FF" />
          </linearGradient>
        </defs>

        <path
          d="M80 26C107 50 128 78 128 106C128 132 106.5 144 80 144C53.5 144 32 132 32 106C32 78 53 50 80 26Z"
          fill="url(#bodyGrad)"
        />

        {/* Floating Hands */}
        {mood === 'happy' || mood === 'cheer' ? (
          <>
            {/* Both arms raised cheering! */}
            <path
              d="M34 100C22 90 18 78 16 70C16 66 22 66 26 70C30 75 34 85 40 94"
              stroke="#5BA7FF"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M126 100C138 90 142 78 144 70C144 66 138 66 134 70C130 75 126 85 120 94"
              stroke="#5BA7FF"
              strokeWidth="7"
              strokeLinecap="round"
            />
          </>
        ) : mood === 'thinking' ? (
          <>
            {/* One hand on chin */}
            <path
              d="M36 104C28 112 24 118 22 124"
              stroke="#5BA7FF"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M124 106C116 112 106 114 96 114"
              stroke="#5BA7FF"
              strokeWidth="7"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            {/* Friendly waving hand */}
            <path
              d="M122 96C134 88 143 78 144 70C144 66 140 65 137 68C130 73 125 82 120 90"
              stroke="#5BA7FF"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M38 104C30 110 24 118 22 124"
              stroke="#5BA7FF"
              strokeWidth="7"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Inner White Friendly Face Display Screen */}
        <ellipse cx="80" cy="102" rx="38" ry="31" fill="url(#faceGrad)" />

        {/* Cheerful Rosy Cheeks */}
        <ellipse cx="56" cy="107" rx="5.5" ry="3.5" fill="#FF8A7A" opacity="0.6" />
        <ellipse cx="104" cy="107" rx="5.5" ry="3.5" fill="#FF8A7A" opacity="0.6" />

        {/* Eyes based on mood */}
        {mood === 'happy' || mood === 'cheer' ? (
          <>
            {/* Happy curved eyes ^^ */}
            <path
              d="M62 98C64 92 72 92 74 98"
              stroke="#24324A"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M86 98C88 92 96 92 98 98"
              stroke="#24324A"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </>
        ) : mood === 'oops' ? (
          <>
            {/* Encouraging wink */}
            <circle cx="68" cy="98" r="5" fill="#24324A" />
            <circle cx="66" cy="96" r="2" fill="#FFFFFF" />
            <path
              d="M86 98C89 95 95 95 98 98"
              stroke="#24324A"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            {/* Big friendly kawaii round eyes with light reflection */}
            <circle cx="68" cy="98" r="5.5" fill="#24324A" />
            <circle cx="66" cy="95.5" r="2" fill="#FFFFFF" />
            <circle cx="70" cy="99.5" r="0.8" fill="#FFFFFF" />

            <circle cx="92" cy="98" r="5.5" fill="#24324A" />
            <circle cx="90" cy="95.5" r="2" fill="#FFFFFF" />
            <circle cx="94" cy="99.5" r="0.8" fill="#FFFFFF" />
          </>
        )}

        {/* Mouth */}
        {mood === 'happy' || mood === 'cheer' ? (
          <path
            d="M72 108C73 115 87 115 88 108Z"
            fill="#FF8A7A"
            stroke="#24324A"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M73 107C75 112 85 112 87 107"
            stroke="#24324A"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}

        {/* Ambient Sparkles */}
        <path
          d="M138 34L140 40L146 42L140 44L138 50L136 44L130 42L136 40L138 34Z"
          fill="#FFD65A"
        />
        <path
          d="M22 66L24 71L29 73L24 75L22 80L20 75L15 73L20 71L22 66Z"
          fill="#A99CFB"
        />
      </svg>
    </div>
  );
};
