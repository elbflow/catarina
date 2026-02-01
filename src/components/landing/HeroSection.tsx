import Link from 'next/link'
import { HeroMockPreview } from './HeroMockPreview'

export function HeroSection() {
  return (
    <section className="relative min-h-[600px] sm:min-h-[700px] flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Image - Using CSS background to avoid Next optimizer issues */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1500937386664-56d1dfefc4db?q=80&w=2070&auto=format&fit=crop)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iLjA1Ii8+PC9zdmc+')] bg-repeat" />
      </div>
      
      {/* Decorative blur blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      {/* Content - 2-column layout on desktop */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Headline & CTAs */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Sustainable pest control, timed perfectly.
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-white/95 mb-4 sm:mb-6 max-w-2xl mx-auto lg:mx-0 font-medium">
              Turn scattered field observations into confident, timely decisions.
            </p>
            <p className="text-base sm:text-lg text-white/85 mb-8 sm:mb-10">
              Helping growers catch the narrow intervention window
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link 
                href="/signup" 
                className="bg-white text-gray-900 hover:bg-gray-50 text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 inline-block text-center"
              >
                Get Started
              </Link>
              <Link 
                href="/login" 
                className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/40 px-8 sm:px-10 py-3 sm:py-4 rounded-lg font-semibold hover:bg-white/20 transition-all text-center"
              >
                Log In
              </Link>
            </div>
          </div>
          
          {/* Right Column - Mock Preview */}
          <div className="flex justify-center lg:justify-end order-first lg:order-last">
            <div className="transform hover:scale-105 transition-transform duration-300 w-full max-w-sm lg:max-w-none">
              <HeroMockPreview />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
