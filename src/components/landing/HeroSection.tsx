import Image from 'next/image'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative min-h-[500px] sm:min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1500937386664-56d1dfefc4db?q=80&w=2070&auto=format&fit=crop"
          alt="Apple orchard at golden hour"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2">
          Sustainable pest control, timed perfectly.
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
          Turn scattered field observations into confident, timely decisions.
        </p>
        <p className="text-white/80 mb-8 sm:mb-10 text-base sm:text-lg px-2">
          Helping growers catch the narrow intervention window
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-2">
          <Link href="/signup" className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 w-full sm:w-auto min-w-[160px] sm:min-w-[180px]">
            Get Started
          </Link>
          <Link href="/login" className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-white/20 transition-colors w-full sm:w-auto min-w-[160px] sm:min-w-[180px] text-center">
            Log In
          </Link>
        </div>
      </div>
    </section>
  )
}
