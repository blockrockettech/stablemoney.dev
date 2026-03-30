import { describe, expect, it } from "vitest"
import { formatUsd } from "./market-data"

describe("formatUsd", () => {
  it("formats large values", () => {
    expect(formatUsd(1.5e12)).toContain("T")
    expect(formatUsd(2.2e9)).toContain("B")
    expect(formatUsd(3.4e6)).toContain("M")
    expect(formatUsd(5000)).toContain("K")
  })

  it("formats small integers", () => {
    expect(formatUsd(42)).toBe("$42")
  })
})
