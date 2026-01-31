'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong!</h1>
            <p className="text-gray-600 mb-6">
              {error.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={reset}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
