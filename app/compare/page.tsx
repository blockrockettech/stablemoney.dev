export default function ComparePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Compare</h1>
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-5">
        <h2 className="text-base font-semibold">Temporarily disabled</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
          The compare section is paused while we finalize how topics map to normalized data points.
          It will return once the mapping model is stable.
        </p>
      </div>
    </div>
  )
}
