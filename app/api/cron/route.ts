import { NextResponse } from "next/server"

// Called daily by a Coolify Scheduled Task (see README > Deploy). It triggers
// Coolify's deploy webhook, which rebuilds the site so the prebuild script
// re-fetches live market data from DefiLlama.
//
// Required env vars (Coolify > Application > Environment Variables):
// - CRON_SECRET: any random string. Callers must send
//   `Authorization: Bearer <CRON_SECRET>`.
// - DEPLOY_HOOK_URL: Coolify > Application > Webhooks > Deploy Webhook,
//   e.g. https://<coolify-host>/api/v1/deploy?uuid=<app-uuid>&force=false
// - DEPLOY_HOOK_TOKEN: Coolify API token (Keys & Tokens > API tokens) with
//   deploy permission. Sent as a Bearer token to the deploy webhook.

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization")
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const deployHookUrl = process.env.DEPLOY_HOOK_URL
  if (!deployHookUrl) {
    return NextResponse.json(
      { error: "DEPLOY_HOOK_URL is not configured" },
      { status: 500 }
    )
  }

  const deployHookToken = process.env.DEPLOY_HOOK_TOKEN
  const response = await fetch(deployHookUrl, {
    method: "POST",
    headers: deployHookToken
      ? { Authorization: `Bearer ${deployHookToken}` }
      : undefined,
    cache: "no-store",
  })
  if (!response.ok) {
    return NextResponse.json(
      { error: `Deploy hook failed with status ${response.status}` },
      { status: 502 }
    )
  }

  return NextResponse.json({ triggered: true })
}
