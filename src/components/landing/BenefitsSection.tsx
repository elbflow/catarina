export function BenefitsSection() {
  const benefits = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Catch the intervention window every time",
      description: "Never miss the narrow window where sustainable pest control actually works.",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      title: "Stay sustainable and certified",
      description: "Maintain organic certification and build trust with customers by avoiding pesticides.",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Replace guesswork with clarity",
      description: "Make confident decisions based on data, not intuition. See trends and risk levels clearly.",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: "Field-ready and simple",
      description: "Designed for real-world use. Record observations quickly, even in the field.",
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
  ]

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Eyebrow */}
        <div className="text-center mb-3">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Key Benefits
          </span>
        </div>
        
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-5 sm:mb-6 text-gray-900">
          Why Catarina Works
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 text-center mb-12 sm:mb-16 max-w-2xl mx-auto leading-relaxed">
          Everything you need to make timely, sustainable pest control decisions
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="card p-6 sm:p-8 flex gap-4 sm:gap-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default"
            >
              <div className={`${benefit.bgColor} ${benefit.color} p-3 sm:p-4 rounded-lg flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shadow-sm`}>
                {benefit.icon}
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
