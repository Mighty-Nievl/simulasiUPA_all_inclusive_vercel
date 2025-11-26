import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Simulasi UPA PERADI - Latihan Ujian Profesi Advokat";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#020617", // slate-950
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1), transparent 50%)",
        }}
      >
        {/* Background Grid Pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            opacity: 0.2,
          }}
        />

        {/* Content Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          {/* Icon/Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "120px",
              height: "120px",
              borderRadius: "30px",
              background: "linear-gradient(135deg, #10b981, #0f766e)", // emerald-500 to teal-700
              boxShadow: "0 0 50px -10px rgba(16, 185, 129, 0.5)",
              marginBottom: "40px",
            }}
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3v17" />
              <path d="M5 6h14" />
              <path d="M5 6l-2 8a3 3 0 0 0 6 0l-2-8" />
              <path d="M19 6l-2 8a3 3 0 0 0 6 0l-2-8" />
              <path d="M9 21h6" />
            </svg>
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              fontSize: "80px",
              fontWeight: 800,
              color: "white",
              marginBottom: "20px",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            Simulasi UPA
          </div>

          {/* Subtitle */}
          <div
            style={{
              display: "flex",
              fontSize: "40px",
              fontWeight: 500,
              color: "#94a3b8", // slate-400
              textAlign: "center",
            }}
          >
            Sistem Pembelajaran Gamifikasi
          </div>
        </div>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
    }
  );
}
