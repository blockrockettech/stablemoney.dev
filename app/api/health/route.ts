import { NextResponse } from "next/server"

// Liveness probe for Coolify (main + preview deployments).
// Configure in Coolify: Health check path `/api/health`, port 3000.
// Kept dependency-free so it only fails when the Next server itself is down.

export const dynamic = "force-dynamic"

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      commit: process.env.SOURCE_COMMIT ?? null,
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}

export function HEAD() {
  return new Response(null, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  })
}
