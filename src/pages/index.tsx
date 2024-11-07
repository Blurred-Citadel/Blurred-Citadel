import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'

type NewsItem = {
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
  impact: string
  sector: string
  analysis?: {
    keyInsights: string[]
    implications: {
      shortTerm: string
      longTerm: string
    }
    relevanceScore: number
    workforceTrends: string[]
  }
}

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSector, setSelectedSector] = useState<string>('all')
  const [selectedImpact, setSelectedImpact] = useState<string>('all')
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Get unique sectors from news items
  const sectors = ['all', ...new Set(news.map(item => item.sector))]
  const impacts = ['all', 'High', 'Medium', 'Low']

  useEffect(() => {
    loadNews()
  }, [])

  async function loadNews() {
    try {
      setLoading(true)
      const response = await fetch('/api/news')
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setNews(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while fetching news')
    } finally {
      setLoading(false)
    }
  }

  // Filter news based on selected sector and impact
  const filteredNews = news.filter(item => {
    const sectorMatch = selectedSector === 'all' || item.sector === selectedSector
    const impactMatch = selectedImpact === 'all' || item.impact === selectedImpact
    return sectorMatch && impactMatch
  })

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-xl text-gray-600">Loading news data...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg shadow">
            Error loading news: {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Blurred Citadel</h1>
            <span className="text-sm text-gray-500">
              Last updated: {format(lastUpdated, 'HH:mm, dd MMM yyyy')}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
              <select
                className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
              >
                {sectors.map(sector => (
                  <option key={sector} value={sector}>
                    {sector.charAt(0).toUpperCase() + sector.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
              <select
                className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={selectedImpact}
                onChange={(e) => setSelectedImpact(e.target.value)}
              >
                {impacts.map(impact => (
                  <option key={impact} value={impact}>
                    {impact.charAt(0).toUpperCase() + impact.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={loadNews}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-auto"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid gap-6">
          {filteredNews.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold flex-grow">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" 
                       className="hover:text-blue-600 hover:underline">
                      {item.title}
                    </a>
                  </h2>
                  <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${getImpactColor(item.impact)}`}>
                    {item.impact}
                  </span>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-2 mb-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    Source: {item.source}
                  </span>
                  <span>•</span>
                  <span>
                    {format(new Date(item.publishedAt), 'dd MMM yyyy')}
                  </span>
                  <span>•</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded">
                    {item.sector}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-6">{item.description}</p>

                {item.analysis ? (
                  <div className="space-y-6">
                    {/* Key Insights */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-3">Key Insights</h3>
                      <ul className="space-y-2">
                        {item.analysis.keyInsights.map((insight, i) => (
                          <li key={i} className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2"></span>
                            <span className="text-gray-600">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Implications */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Short Term Impact</h4>
                        <p className="text-gray-600">{item.analysis.implications.shortTerm}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Long Term Impact</h4>
                        <p className="text-gray-600">{item.analysis.implications.longTerm}</p>
                      </div>
                    </div>

                    {/* Workforce Trends */}
                    {item.analysis.workforceTrends.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Workforce Trends</h3>
                        <div className="flex flex-wrap gap-2">
                          {item.analysis.workforceTrends.map((trend, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                              {trend}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-50 text-yellow-600 p-4 rounded-lg">
                    Analysis in progress...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
