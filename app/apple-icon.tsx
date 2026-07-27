import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6366f1 0%, #a855f7 55%, #ec4899 100%)",
          borderRadius: 40,
        }}
      >
        <svg width="112" height="112" viewBox="0 0 32 32" fill="none">
          <path
            d="M16 4.5A11.5 11.5 0 1 1 5.47 19.5"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="5.2" cy="20.2" r="2.4" fill="#ffffff" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
