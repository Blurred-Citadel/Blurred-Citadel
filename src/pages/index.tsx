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
      
      <div className="space-y-6">
        {news.map((item, index) => (
          <div key={index} className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-2">
              <a href={item.url} className="text-gray-900 hover:text-blue-600">
                {item.title}
              </a>
            </h2>
            <div className="text-sm text-gray-500 mb-4">
              Source: {item.source} | Impact: {item.impact} | Sector: {item.sector}
            </div>
            <p className="text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
