import { readFile } from "fs/promises"
import path from "path"

export async function loadCoinMdx(symbol: string): Promise<string | null> {
  const file = path.join(process.cwd(), "site/content/coins", `${symbol.toLowerCase()}.mdx`)
  try {
    return await readFile(file, "utf8")
  } catch {
    return null
  }
}
