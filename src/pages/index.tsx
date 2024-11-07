import React, { useEffect, useState } from 'react'

type NewsItem = {
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
  impact: string
  sector: string
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
        <div className="text-center py-10">Loading news...</div>
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
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Key Stories</h2>
          <div className="space-y-4">
            {news.map((item, index) => (
              <div key={index} className="border-b pb-4">
                <h3 className="font-medium">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" 
                     className="hover:text-blue-600">
                    {item.title}
                  </a>
                </h3>
                <p className="text-gray-600 mt-1">{item.description}</p>
                <div className="mt-2 text-sm text-blue-600">
                  Impact: {item.impact} | Sector: {item.sector} | 
                  Source: {item.source} | 
                  Published: {new Date(item.publishedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Analysis</h2>
          <div className="prose">
            <p>Key sectors in today's news:</p>
            <ul className="list-disc pl-4 space-y-2">
              {Array.from(new Set(news.map(item => item.sector))).map((sector, index) => (
                <li key={index}>
                  {sector}: {news.filter(item => item.sector === sector).length} stories
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Action Items</h2>
          <div className="space-y-2">
            {news
              .filter(item => item.impact === 'High')
              .map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span>Monitor developments in {item.sector}: {item.title}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
