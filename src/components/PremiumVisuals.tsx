export function HeroAiIllustration() {
  return (
    <svg viewBox="0 0 520 360" className="h-full w-full" role="img" aria-label="AI assistant interface illustration">
      <defs>
        <linearGradient id="pv-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#dcfce7" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#bbf7d0" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="pv-accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="pv-surface" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#f0fdf4" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="520" height="360" rx="30" fill="url(#pv-bg)" />
      <circle cx="95" cy="85" r="70" fill="#86efac" opacity="0.35" />
      <circle cx="442" cy="282" r="78" fill="#34d399" opacity="0.22" />

      <rect x="42" y="34" width="436" height="292" rx="24" fill="url(#pv-surface)" stroke="#86efac" strokeOpacity="0.55" />
      <rect x="66" y="58" width="388" height="34" rx="10" fill="#ecfdf5" />
      <circle cx="88" cy="75" r="5" fill="#f87171" />
      <circle cx="104" cy="75" r="5" fill="#fbbf24" />
      <circle cx="120" cy="75" r="5" fill="#34d399" />
      <rect x="286" y="68" width="150" height="14" rx="7" fill="#bbf7d0" />

      <rect x="80" y="116" width="160" height="160" rx="18" fill="#ecfdf5" stroke="#bbf7d0" />
      <circle cx="160" cy="173" r="40" fill="url(#pv-accent)" />
      <path d="M160 150l8 16 18 3-13 13 3 18-16-8-16 8 3-18-13-13 18-3z" fill="#ecfeff" />
      <rect x="104" y="230" width="112" height="10" rx="5" fill="#a7f3d0" />
      <rect x="117" y="246" width="86" height="8" rx="4" fill="#d1fae5" />

      <rect x="266" y="116" width="170" height="52" rx="14" fill="#ffffff" stroke="#d1fae5" />
      <rect x="279" y="129" width="16" height="16" rx="8" fill="#10b981" />
      <rect x="304" y="130" width="112" height="8" rx="4" fill="#6ee7b7" />
      <rect x="304" y="144" width="88" height="7" rx="3.5" fill="#bbf7d0" />

      <rect x="286" y="184" width="150" height="38" rx="12" fill="#065f46" opacity="0.94" />
      <rect x="300" y="198" width="118" height="8" rx="4" fill="#6ee7b7" />

      <rect x="266" y="234" width="170" height="42" rx="12" fill="#ffffff" stroke="#d1fae5" />
      <rect x="279" y="248" width="94" height="8" rx="4" fill="#86efac" />
      <rect x="279" y="261" width="62" height="6" rx="3" fill="#bbf7d0" />
    </svg>
  );
}

export function ChatEmptyIllustration() {
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" role="img" aria-label="Assistant welcome illustration">
      <defs>
        <linearGradient id="ce-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0fdf4" />
          <stop offset="100%" stopColor="#dcfce7" />
        </linearGradient>
        <linearGradient id="ce-accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="320" height="180" rx="18" fill="url(#ce-bg)" />
      <circle cx="44" cy="42" r="22" fill="#86efac" opacity="0.45" />
      <circle cx="284" cy="148" r="26" fill="#34d399" opacity="0.25" />

      <rect x="24" y="24" width="272" height="132" rx="16" fill="#ffffff" stroke="#bbf7d0" />
      <rect x="40" y="42" width="48" height="48" rx="14" fill="url(#ce-accent)" />
      <path d="M64 52l5.8 11.8 13 1.9-9.4 9.2 2.2 12.9L64 82l-11.6 6.1 2.2-12.9-9.4-9.2 13-1.9z" fill="#ecfeff" />

      <rect x="102" y="46" width="166" height="10" rx="5" fill="#6ee7b7" />
      <rect x="102" y="62" width="124" height="8" rx="4" fill="#bbf7d0" />

      <rect x="40" y="106" width="108" height="28" rx="10" fill="#ecfdf5" stroke="#bbf7d0" />
      <rect x="56" y="117" width="72" height="7" rx="3.5" fill="#86efac" />

      <rect x="164" y="100" width="104" height="34" rx="11" fill="#065f46" opacity="0.94" />
      <rect x="180" y="114" width="72" height="7" rx="3.5" fill="#6ee7b7" />
    </svg>
  );
}
