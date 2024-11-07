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
  const [expandedCard, setExpandedCard] = useState<number | null>(null)

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

  const toggleCard = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index)
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
          <div 
            key={index} 
            className={`relative bg-white shadow rounded-lg transition-all duration-300 ${
              expandedCard === index 
                ? 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 md:w-3/4 lg:w-2/3 h-5/6 z-50 overflow-y-auto'
                : 'h-[400px] cursor-pointer hover:shadow-lg'
            }`}
          >
            {/* Overlay when card is expanded */}
            {expandedCard === index && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => toggleCard(index)}
              />
            )}

            <div className="p-4 h-full flex flex-col">
              {/* Close button for expanded card */}
              {expandedCard === index && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCard(index);
                  }}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Card Header */}
              <div 
                className="flex-none"
                onClick={() => toggleCard(index)}
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h2>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${item.impact.toLowerCase() === 'high' ? 'bg-red-100 text-red-800' : 
                      item.impact.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-blue-100 text-blue-800'}`}
                  >
                    {item.impact}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {item.sector}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div 
                className={`${expandedCard === index ? '' : 'overflow-hidden'}`}
                onClick={() => toggleCard(index)}
              >
                {expandedCard === index ? (
                  // Expanded View
                  <div className="space-y-6">
                    <div>
                      <p className="text-gray-600 mb-4">{item.description}</p>
                      
                      {item.analysis && (
                        <>
                          <div className="border-t pt-4 mb-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Key Insights</h3>
                            <ul className="list-disc list-inside space-y-2">
                              {item.analysis.keyInsights.map((insight, i) => (
                                <li key={i} className="text-gray-600">{insight}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="border-t pt-4 mb-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Implications</h3>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium text-gray-700">Short Term</h4>
                                <p className="text-gray-600">{item.analysis.implications.shortTerm}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-700">Long Term</h4>
                                <p className="text-gray-600">{item.analysis.implications.longTerm}</p>
                              </div>
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Workforce Trends</h3>
                            <div className="flex flex-wrap gap-2">
                              {item.analysis.workforceTrends.map((trend, i) => (
                                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                  {trend}
                                </span>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  // Collapsed View
                  <div>
                    <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>
                    {item.analysis && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">Click to view full analysis</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-auto pt-4 text-xs text-gray-500">
                {item.source} • {new Date(item.publishedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
