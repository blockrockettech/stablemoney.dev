import type { NetworkDeployment } from "@/types"

export const PROXY_LABELS: Record<NonNullable<NetworkDeployment["proxyType"]>, string> = {
  none: "Immutable",
  transparent: "Transparent",
  uups: "UUPS",
  beacon: "Beacon",
  custom: "Custom",
}

export const PROXY_CLASSES: Record<NonNullable<NetworkDeployment["proxyType"]>, string> = {
  none: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  transparent: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  uups: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  beacon: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  custom: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
}
