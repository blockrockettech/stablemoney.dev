import { cn } from "@/lib/utils"

export function NetworkChip({
  name,
  isPrimary,
  className,
}: {
  name: string
  isPrimary: boolean
  className?: string
}) {
  const display = name.length > 18 ? `${name.slice(0, 16)}…` : name
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center truncate rounded-md border px-2 py-0.5 text-xs",
        isPrimary
          ? "border-primary/50 bg-primary/15 text-foreground"
          : "border-border bg-muted/50 text-muted-foreground",
        className
      )}
      title={name}
    >
      {display}
    </span>
  )
}
