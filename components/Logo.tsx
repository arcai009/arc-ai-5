export function LogoMark({
  size = 28,
  gradientId = "arc-logo-gradient",
}: {
  size?: number;
  gradientId?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="4" y1="26" x2="28" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="0.55" stopColor="#a855f7" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <path
        d="M16 4.5A11.5 11.5 0 1 1 5.47 19.5"
        stroke={`url(#${gradientId})`}
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="5.2" cy="20.2" r="2.4" fill={`url(#${gradientId})`} />
    </svg>
  );
}

export function Logo({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark size={size} />
      <span
        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text font-semibold tracking-tight text-transparent"
        style={{ fontSize: size * 0.72 }}
      >
        arc ai
      </span>
    </span>
  );
}
