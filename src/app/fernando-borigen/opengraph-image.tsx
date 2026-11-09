import { ImageResponse } from "next/og";
import { fullName, profileConfig } from "./profile-config";

export const alt = `${fullName} — ${profileConfig.position}, ${profileConfig.organization}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Share preview in the Obsidian palette (default OG font; no network fetch). */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0c0c0c 0%, #121212 30%, #090909 30%, #0d0d0d 60%, #080808 60%, #080808 100%)",
          color: "#f5f5f3",
        }}
      >
        <div style={{ fontSize: 84, fontFamily: "serif", letterSpacing: -1 }}>
          {fullName}
        </div>
        <div
          style={{
            marginTop: 22,
            fontSize: 26,
            letterSpacing: 14,
            color: "#d2d2d0",
            textTransform: "uppercase",
          }}
        >
          {profileConfig.position}
        </div>
        <div
          style={{
            width: 160,
            height: 2,
            margin: "34px 0",
            background:
              "linear-gradient(90deg, transparent, #c62828, #e41d30, #c62828, transparent)",
          }}
        />
        <div
          style={{
            fontSize: 24,
            letterSpacing: 10,
            color: "#a6a6a6",
            textTransform: "uppercase",
          }}
        >
          {profileConfig.organization}
        </div>
      </div>
    ),
    size
  );
}
