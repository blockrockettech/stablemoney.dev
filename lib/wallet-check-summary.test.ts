import { describe, expect, it } from "vitest"
import { getWalletCheckSummary } from "./wallet-check-summary"

describe("getWalletCheckSummary", () => {
  it("counts flags, live rows, and errors", () => {
    const rows = [
      { status: "clear", chain: "eth" },
      { status: "blacklisted", chain: "eth" },
      { status: "frozen", chain: "arb" },
      { status: "coming-soon", chain: "tron" },
      { status: "error", chain: "eth" },
      { status: "no-controls", chain: "" },
    ]
    const { flags, live, errors } = getWalletCheckSummary(rows)
    expect(flags).toHaveLength(2)
    // live = not coming-soon, not no-controls, not pending-abi (includes clear, flags, errors)
    expect(live).toHaveLength(4)
    expect(errors).toHaveLength(1)
  })
})
