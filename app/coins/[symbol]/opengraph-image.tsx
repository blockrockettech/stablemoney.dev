import { ImageResponse } from "next/og"
import { coinBySymbol } from "@/data/coins"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function CoinOpenGraphImage({ params }: { params: { symbol: string } }) {
  const coin = coinBySymbol[params.symbol.toUpperCase()]
  const symbol = coin?.symbol ?? params.symbol.toUpperCase()
  const name = coin?.name ?? ""
  const issuer = coin?.issuer ?? ""

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(155deg, #0c1222 0%, #0f1f14 42%, #0a1520 100%)",
        }}
      >
        {/* Top: coin identity */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              letterSpacing: -4,
              color: "#4ade80",
              lineHeight: 1,
            }}
          >
            {symbol}
          </div>
          {name ? (
            <div
              style={{
                fontSize: 36,
                fontWeight: 600,
                color: "#e2e8f0",
                letterSpacing: -1,
              }}
            >
              {name}
            </div>
          ) : null}
          {issuer ? (
            <div style={{ fontSize: 24, color: "#94a3b8" }}>{issuer}</div>
          ) : null}
        </div>

        {/* Bottom: site branding */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: -1,
          }}
        >
          <span style={{ color: "#4ade80" }}>StableMoney</span>
          <span style={{ color: "#e2e8f0" }}>.dev</span>
          <span
            style={{
              fontSize: 20,
              color: "#64748b",
              marginLeft: 20,
              fontWeight: 400,
            }}
          >
            stablecoin technical reference
          </span>
        </div>
      </div>
    ),
    { ...size },
  )
}
