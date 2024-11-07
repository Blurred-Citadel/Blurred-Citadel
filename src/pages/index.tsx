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
    async function loadNews() {
      try {
        setLoading(true)
        const response = await fetch('/api/news')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log('Received data:', data) // Debug log
        setNews(data)
      } catch (err) {
        console.error('Fetch error:', err) // Debug log
        setError(err instanceof Error ? err.message : 'An error occurred while fetching news')
      } finally {
        setLoading(false)
      }
    }

    loadNews()
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Blurred Citadel</h1>
        <div className="text-center py-10">Loading news data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Blurred Citadel</h1>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Error loading news: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Blurred Citadel</h1>
      
      <div className="space-y-6">
        {news.map((item, index) => (
          <div key={index} className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">
              <a href={item.url} target="_blank" rel="noopener noreferrer" 
                 className="hover:text-blue-600">
                {item.title}
              </a>
            </h2>
            
            <div className="mb-4 text-sm text-gray-600">
              Source: {item.source} | Published: {new Date(item.publishedAt).toLocaleDateString()}
            </div>

            <p className="mb-4 text-gray-600">{item.description}</p>

            {item.analysis ? (
              <>
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Key Insights:</h3>
                  <ul className="list-disc pl-4 space-y-1">
                    {item.analysis.keyInsights.map((insight, i) => (
                      <li key={i} className="text-gray-600">{insight}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium mb-2">Implications:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Short Term</h4>
                      <p className="text-gray-600">{item.analysis.implications.shortTerm}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Long Term</h4>
                      <p className="text-gray-600">{item.analysis.implications.longTerm}</p>
                    </div>
                  </div>
                </div>

                {item.analysis.workforceTrends.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Workforce Trends:</h3>
                    <div className="flex flex-wrap gap-2">
                      {item.analysis.workforceTrends.map((trend, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          {trend}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-yellow-600 bg-yellow-50 p-4 rounded">
                Analysis in progress...
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
