import type { NextApiRequest, NextApiResponse } from 'next'

const NEWS_API_KEY = process.env.NEWS_API_KEY

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const response = await fetch(
            `https://newsapi.org/v2/everything?` +
            `q=workforce&` +
            `language=en&` +
            `sortBy=relevancy&` +
            `pageSize=12&` +
            `apiKey=${NEWS_API_KEY}`
        )

        const data = await response.json()

        // Basic processing without AI analysis
        const articles = data.articles.map((article: any) => ({
            title: article.title || 'No title',
            description: article.description || 'No description',
            url: article.url || '#',
            source: article.source?.name || 'Unknown source',
            publishedAt: article.publishedAt || new Date().toISOString(),
            impact: 'Medium',
            sector: 'General',
            analysis: {
                keyInsights: ['Basic analysis'],
                implications: {
                    shortTerm: 'Analysis in development',
                    longTerm: 'Analysis in development'
                },
                relevanceScore: 5,
                workforceTrends: ['Trend analysis in development']
            }
        }))

        res.status(200).json(articles)

    } catch (error) {
        console.error('API Error:', error)
        res.status(500).json({ error: 'Failed to fetch news' })
    }
}
