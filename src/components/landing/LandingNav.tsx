import Link from 'next/link'

export function LandingNav() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🐞</span>
            <span className="text-xl font-semibold text-gray-900">Catarina</span>
          </Link>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <Link 
              href="/about" 
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm sm:text-base"
            >
              About
            </Link>
            <Link 
              href="/login" 
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm sm:text-base hidden sm:inline"
            >
              Log In
            </Link>
            <Link 
              href="/signup" 
              className="btn-primary text-sm sm:text-base px-4 sm:px-6"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
