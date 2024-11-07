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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">Blurred Citadel</h1>
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">Blurred Citadel</h1>
        <div className="bg-red-50 text-red-600 p-4 rounded">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Blurred Citadel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {news.map((item, index) => (
          <div key={index} className="bg-white shadow rounded-lg hover:shadow-lg transition-shadow duration-200 flex flex-col h-[500px]">
            {/* Title Section - Fixed height */}
            <div className="p-4 border-b h-24">
              <h2 className="text-lg font-semibold">
                <a href={item.url} className="text-gray-900 hover:text-blue-600">
                  {item.title.length > 80 ? `${item.title.substring(0, 80)}...` : item.title}
                </a>
              </h2>
            </div>

            {/* Tags Section - Fixed height */}
            <div className="p-4 h-16">
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium 
                  ${item.impact.toLowerCase() === 'high' ? 'bg-red-100 text-red-800' : 
                    item.impact.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-blue-100 text-blue-800'}`}>
                  {item.impact}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {item.sector}
                </span>
              </div>
            </div>

            {/* Description Section - Fixed height */}
            <div className="px-4 pb-4 h-24">
              <p className="text-sm text-gray-600">
                {item.description.length > 150 ? `${item.description.substring(0, 150)}...` : item.description}
              </p>
            </div>

            {/* Analysis Section - Fixed height */}
            {item.analysis && (
              <div className="p-4 border-t">
                <h3 className="text-xs font-semibold text-gray-900 uppercase mb-2">Key Insights</h3>
                <ul className="text-sm space-y-1">
                  {item.analysis.keyInsights.slice(0, 2).map((insight, i) => (
                    <li key={i} className="text-gray-600">
                      • {insight.length > 100 ? `${insight.substring(0, 100)}...` : insight}
                    </li>
                  ))}
                </ul>

                {item.analysis.workforceTrends.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-1">
                      {item.analysis.workforceTrends.slice(0, 2).map((trend, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                          {trend.length > 20 ? `${trend.substring(0, 20)}...` : trend}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer Section - Fixed height */}
            <div className="p-4 border-t mt-auto">
              <div className="text-xs text-gray-500">
                Source: {item.source}
                <br />
                {new Date(item.publishedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
