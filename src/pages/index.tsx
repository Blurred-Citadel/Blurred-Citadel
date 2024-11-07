import React, { useEffect, useState } from 'react'

type NewsItem = {
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
  impact: string
  sector: string
  analysis: {
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
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Blurred Citadel</h1>
        <div className="text-center py-10">Analyzing news data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Blurred Citadel</h1>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
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
              <span className={`ml-2 px-2 py-1 rounded ${
                item.impact === 'High' ? 'bg-red-100 text-red-800' :
                item.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                Impact: {item.impact}
              </span>
              <span className="ml-2 px-2 py-1 rounded bg-gray-100">
                Relevance: {item.analysis.relevanceScore}/10
              </span>
            </div>

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
              <div className="grid grid-cols-2 gap-4">
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
          </div>
        ))}
      </div>
    </div>
  )
}
