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
          <div key={index}>
            {/* Regular Card */}
            <div 
              className="bg-white shadow rounded-lg transition-all duration-300 h-[400px] cursor-pointer hover:shadow-lg"
              onClick={() => toggleCard(index)}
            >
              <div className="p-4 h-full flex flex-col">
                {/* Card Header */}
                <div className="flex-none">
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
                <div className="flex-grow overflow-hidden">
                  <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>
                  {item.analysis && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Click to view full analysis</p>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                  {item.source} • {new Date(item.publishedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Expanded Card Modal */}
            {expandedCard === index && (
              <>
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 z-40"
                  onClick={() => toggleCard(index)}
                />
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                             bg-white rounded-lg shadow-xl z-50 w-[90%] max-w-6xl max-h-[80vh] 
                             overflow-y-auto">
                  <div className="p-6">
                    {/* Close Button */}
                    <button 
                      onClick={() => toggleCard(index)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Content */}
                    <div className="grid grid-cols-3 gap-6">
                      {/* Left Column */}
                      <div className="col-span-1">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h2>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className={`px-2 py-1 rounded-full text-sm font-medium 
                            ${item.impact.toLowerCase() === 'high' ? 'bg-red-100 text-red-800' : 
                              item.impact.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-blue-100 text-blue-800'}`}
                          >
                            {item.impact}
                          </span>
                          <span className="px-2 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                            {item.sector}
                          </span>
                        </div>
                        <p className="text-gray-600">{item.description}</p>
                        <div className="mt-4 text-sm text-gray-500">
                          {item.source} • {new Date(item.publishedAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="col-span-2">
                        {item.analysis && (
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Insights</h3>
                              <ul className="space-y-2">
                                {item.analysis.keyInsights.map((insight, i) => (
                                  <li key={i} className="flex items-start">
                                    <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 bg-blue-600 rounded-full mr-2"></span>
                                    <span className="text-gray-600">{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-3">Implications</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded">
                                  <h4 className="font-medium text-gray-900 mb-2">Short Term</h4>
                                  <p className="text-gray-600">{item.analysis.implications.shortTerm}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded">
                                  <h4 className="font-medium text-gray-900 mb-2">Long Term</h4>
                                  <p className="text-gray-600">{item.analysis.implications.longTerm}</p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-3">Workforce Trends</h3>
                              <div className="flex flex-wrap gap-2">
                                {item.analysis.workforceTrends.map((trend, i) => (
                                  <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                                    {trend}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
