import React, { useEffect, useState } from 'react'

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

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/news')
      const data = await response.json()
      setNews(data)
    } catch (err) {
      setError('Failed to fetch news')
      console.error('Error fetching news:', err)
    } finally {
      setLoading(false)
    }
  }

  // Helper function for impact badge colors
  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Blurred Citadel</h1>
          <div className="animate-pulse text-center text-gray-500">Loading news data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Blurred Citadel</h1>
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Blurred Citadel</h1>
        
        <div className="space-y-6">
          {news.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 hover:underline"
                    >
                      {item.title}
                    </a>
                  </h2>
                  <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${getImpactColor(item.impact)}`}>
                    {item.impact}
                  </span>
                </div>

                {/* Meta Information */}
                <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-4">
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {item.sector}
                  </span>
                  <span>•</span>
                  <span>{item.source}</span>
                  <span>•</span>
                  <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-6">{item.description}</p>

                {/* Analysis Section */}
                {item.analysis && (
                  <div className="space-y-6 border-t pt-6">
                    {/* Key Insights */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                        Key Insights
                      </h3>
                      <ul className="space-y-2">
                        {item.analysis.keyInsights.map((insight, i) => (
                          <li key={i} className="flex items-start">
                            <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 bg-blue-600 rounded-full mr-2"></span>
                            <span className="text-gray-600">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Implications */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">
                          Short Term
                        </h4>
                        <p className="text-gray-600">{item.analysis.implications.shortTerm}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">
                          Long Term
                        </h4>
                        <p className="text-gray-600">{item.analysis.implications.longTerm}</p>
                      </div>
                    </div>

                    {/* Workforce Trends */}
                    {item.analysis.workforceTrends.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                          Workforce Trends
                        </h3>
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
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
