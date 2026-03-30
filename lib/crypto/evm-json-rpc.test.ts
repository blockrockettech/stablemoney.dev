import { describe, expect, it } from "vitest"
import { decodeBool, decodeUint256, encodeCall } from "./evm-json-rpc"

describe("encodeCall", () => {
  it("pads address and appends to selector", () => {
    const sel = "0xfe575a87"
    const addr = "0x0000000000000000000000000000000000000001"
    expect(encodeCall(sel, addr)).toBe(
      `${sel}0000000000000000000000000000000000000000000000000000000000000001`,
    )
  })

  it("normalizes mixed-case address", () => {
    expect(
      encodeCall("0xabcd", "0xAbCdEf0123456789AbCdEf0123456789AbCdEf01"),
    ).toMatch(/abcdef0123456789abcdef0123456789abcdef01$/)
  })
})

describe("decodeBool", () => {
  it("returns null for empty", () => {
    expect(decodeBool(null)).toBeNull()
    expect(decodeBool("0x")).toBeNull()
  })

  it("reads last hex digit as bool", () => {
    expect(decodeBool("0x0000000000000000000000000000000000000000000000000000000000000001")).toBe(
      true,
    )
    expect(decodeBool("0x0000000000000000000000000000000000000000000000000000000000000000")).toBe(
      false,
    )
  })
})

describe("decodeUint256", () => {
  it("parses hex", () => {
    expect(decodeUint256("0x0a")).toBe(10n)
  })

  it("returns null for invalid", () => {
    expect(decodeUint256(null)).toBeNull()
    expect(decodeUint256("0xzz")).toBeNull()
  })
})
