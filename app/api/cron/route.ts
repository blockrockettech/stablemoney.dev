import { NextResponse } from "next/server"

// Vercel Cron Jobs invoke this route on a schedule (see vercel.json).
// It triggers a Deploy Hook, which redeploys the site so the prebuild
// script re-fetches live market data from DefiLlama.
//
// Required env vars (set in Vercel Project Settings > Environment Variables):
// - CRON_SECRET: any random string. Vercel automatically sends it as
//   `Authorization: Bearer <CRON_SECRET>` on cron-triggered requests.
// - DEPLOY_HOOK_URL: create in Project Settings > Git > Deploy Hooks.

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const deployHookUrl = process.env.DEPLOY_HOOK_URL
  if (!deployHookUrl) {
    return NextResponse.json(
      { error: "DEPLOY_HOOK_URL is not configured" },
      { status: 500 }
    )
  }

  const response = await fetch(deployHookUrl, { method: "POST" })
  if (!response.ok) {
    return NextResponse.json(
      { error: `Deploy hook failed with status ${response.status}` },
      { status: 502 }
    )
  }

  return NextResponse.json({ triggered: true })
}
