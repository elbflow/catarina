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
    <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 sm:mb-4 text-gray-900">
          Why Catarina Works
        </h2>
        <p className="text-base sm:text-lg text-gray-600 text-center mb-10 sm:mb-16 max-w-2xl mx-auto">
          Everything you need to make timely, sustainable pest control decisions
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="card p-6 flex gap-4">
              <div className={`${benefit.bgColor} ${benefit.color} p-3 rounded-lg flex-shrink-0 w-14 h-14 flex items-center justify-center`}>
                {benefit.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
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
