"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CopyButton({
  text,
  className,
  label = "Copy address",
}: {
  text: string
  className?: string
  label?: string
}) {
  const [copied, setCopied] = React.useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("size-8 shrink-0", className)}
      onClick={handleCopy}
      aria-label={label}
      title={label}
    >
      {copied ? (
        <Check className="size-4 text-green-600 dark:text-green-400" />
      ) : (
        <Copy className="size-4" />
      )}
    </Button>
  )
}
