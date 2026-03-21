import type { ComponentPropsWithoutRef } from "react"
import { MDXRemote } from "next-mdx-remote/rsc"

const mdxComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      className="mt-8 mb-3 text-lg font-semibold tracking-tight first:mt-0"
      {...props}
    />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p
      className="text-muted-foreground mb-4 text-sm leading-relaxed last:mb-0"
      {...props}
    />
  ),
}

export async function CoinMdx({ source }: { source: string }) {
  return await MDXRemote({ source, components: mdxComponents })
}
