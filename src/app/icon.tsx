import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: "linear-gradient(135deg, #10b981, #0f766e)", // emerald-500 to teal-700
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "8px", // Rounded square
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3v18m-9-6l9-6 9 6" />
          <path d="M5 15a4 4 0 0 0 8 0" />
          <path d="M11 15a4 4 0 0 0 8 0" />
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
