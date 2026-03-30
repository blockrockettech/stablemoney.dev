import { ImageResponse } from "next/og"

export const alt = "StableMoney.dev — stablecoin technical reference"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(155deg, #0c1222 0%, #0f1f14 42%, #0a1520 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            fontSize: 68,
            fontWeight: 700,
            letterSpacing: -3,
            lineHeight: 1.05,
          }}
        >
          <span style={{ color: "#4ade80" }}>StableMoney</span>
          <span style={{ color: "#e2e8f0" }}>.dev</span>
        </div>
        <div
          style={{
            fontSize: 30,
            color: "#94a3b8",
            marginTop: 20,
            maxWidth: 880,
            lineHeight: 1.35,
          }}
        >
          Stablecoin technical reference for engineers — contracts, EIPs, risks
        </div>
      </div>
    ),
    { ...size },
  )
}
