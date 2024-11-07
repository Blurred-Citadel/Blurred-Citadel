import React, { useEffect, useState } from 'react'

// ... (keep existing NewsItem type)

const CATEGORIES = [
  { id: 'ai', name: 'AI & Automation' },
  { id: 'labor', name: 'Labour Market' },
  { id: 'msp', name: 'MSP/RPO' },
  { id: 'stem', name: 'STEM' },
  { id: 'chomsky', name: 'Critical Analysis' },
  { id: 'all', name: 'All Categories' }
]

const REGIONS = [
  { id: 'uk', name: 'United Kingdom' },
  { id: 'usa', name: 'United States' },
  { id: 'eu', name: 'Europe' },
  { id: 'global', name: 'Global' }
]

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('global')

  useEffect(() => {
    fetchNews()
  }, [selectedCategory, selectedRegion])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/news?category=${selectedCategory}&region=${selectedRegion}`)
      const data = await response.json()
      setNews(data)
    } catch (err) {
      setError('Failed to fetch news')
      console.error('Error fetching news:', err)
    } finally {
      setLoading(false)
    }
  }

  // ... (keep existing toggleCard function)

  const FilterButton = ({ 
    active, 
    onClick, 
    children 
  }: { 
    active: boolean; 
    onClick: () => void; 
    children: React.ReactNode 
  }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 
        ${active 
          ? 'bg-gray-900 text-white' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
    >
      {children}
    </button>
  )

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-extrabold mb-8 tracking-tight">
        <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 bg-clip-text text-transparent">
          Blurred Citadel
        </span>
      </h1>

      {/* Filters Section */}
      <div className="mb-8 space-y-4">
        {/* Categories */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-2">Category Focus</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(category => (
              <FilterButton
                key={category.id}
                active={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </FilterButton>
            ))}
          </div>
        </div>

        {/* Regions */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-2">Geographic Region</h2>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map(region => (
              <FilterButton
                key={region.id}
                active={selectedRegion === region.id}
                onClick={() => setSelectedRegion(region.id)}
              >
                {region.name}
              </FilterButton>
            ))}
          </div>
        </div>

        {/* Active Filters Display */}
        <div className="pt-2">
          <div className="text-sm text-gray-500">
            Showing: {' '}
            <span className="font-medium text-gray-900">
              {CATEGORIES.find(c => c.id === selectedCategory)?.name} • {REGIONS.find(r => r.id === selectedRegion)?.name}
            </span>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Rest of your existing JSX... */}
    </div>
  )
}
