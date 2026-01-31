import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card text-center max-w-md">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-semibold mb-3">Page Not Found</h1>
        <p className="text-gray-600 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="btn-primary inline-block">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
