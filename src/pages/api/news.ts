import type { NextApiRequest, NextApiResponse } from 'next'

const NEWS_API_KEY = process.env.NEWS_API_KEY

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Keywords relevant to workforce solutions
    const keywords = 'workforce OR recruitment OR "labor market" OR "job market" OR employment OR staffing'
    
    const response = await fetch(
      `https://newsapi.org/v2/everything?` +
      `q=${keywords}&` +
      `language=en&` +
      `sortBy=relevancy&` +
      `pageSize=10&` +
      `apiKey=${NEWS_API_KEY}`
    )

    const data = await response.json()

    // Format the news data
    const formattedNews = data.articles.map((article: any) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      source: article.source.name,
      publishedAt: article.publishedAt,
      // Simple impact assessment based on source and freshness
      impact: article.source.name.includes('Reuters') || article.source.name.includes('Bloomberg') 
        ? 'High' : 'Medium',
      sector: determineSector(article.title + ' ' + article.description)
    }))

    res.status(200).json(formattedNews)
  } catch (error) {
    console.error('News API Error:', error)
    res.status(500).json({ error: 'Failed to fetch news' })
  }
}

// Simple sector determination function
function determineSector(content: string) {
  const lowercase = content.toLowerCase()
  if (lowercase.includes('tech') || lowercase.includes('technology')) return 'Technology'
  if (lowercase.includes('finance') || lowercase.includes('banking')) return 'Finance'
  if (lowercase.includes('healthcare') || lowercase.includes('medical')) return 'Healthcare'
  if (lowercase.includes('manufacturing')) return 'Manufacturing'
  return 'Cross-Industry'
}
