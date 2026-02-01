'use client'

import { useState, useEffect, useRef } from 'react'

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

interface LocationSearchProps {
  onSelect: (location: { name: string; lat: number; lng: number }) => void
  placeholder?: string
  initialValue?: string
}

export function LocationSearch({ onSelect, placeholder = 'Search for a location...', initialValue = '' }: LocationSearchProps) {
  const [query, setQuery] = useState(initialValue)
  const [results, setResults] = useState<NominatimResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search
  useEffect(() => {
    if (selected) return // Don't search after selection

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.length < 3) {
      setResults([])
      setIsOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
          {
            headers: {
              'User-Agent': 'Catarina-IPM-App',
            },
          }
        )
        const data: NominatimResult[] = await res.json()
        setResults(data)
        setIsOpen(data.length > 0)
      } catch (error) {
        console.error('Location search failed:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 500) // 500ms debounce to respect rate limits

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, selected])

  const handleSelect = (result: NominatimResult) => {
    // Extract a shorter name (first part before the comma usually)
    const shortName = result.display_name.split(',').slice(0, 2).join(',').trim()
    setQuery(shortName)
    setSelected(true)
    setIsOpen(false)
    onSelect({
      name: shortName,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    })
  }

  const handleInputChange = (value: string) => {
    setQuery(value)
    setSelected(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="input pr-10"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
        {selected && !loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.place_id}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">
                {result.display_name.split(',').slice(0, 2).join(',')}
              </div>
              <div className="text-gray-500 text-xs truncate">
                {result.display_name}
              </div>
            </button>
          ))}
        </div>
      )}

      {query.length > 0 && query.length < 3 && !selected && (
        <p className="text-xs text-gray-400 mt-1">Type at least 3 characters to search</p>
      )}
    </div>
  )
}
