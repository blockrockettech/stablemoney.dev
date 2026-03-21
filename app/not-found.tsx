import Link from "next/link"

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-semibold">Not found</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        That page or coin does not exist in this reference.
      </p>
      <Link
        href="/"
        className="text-primary mt-6 inline-block text-sm font-medium hover:underline"
      >
        Back to home
      </Link>
    </div>
  )
}
