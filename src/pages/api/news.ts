import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const NEWS_API_KEY = process.env.NEWS_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Fetch news
        const response = await fetch(
            `https://newsapi.org/v2/everything?` +
            `q=workforce OR recruitment OR "talent acquisition"&` +
            `language=en&` +
            `sortBy=relevancy&` +
            `pageSize=12&` +
            `apiKey=${NEWS_API_KEY}`
        )

        const data = await response.json()

        // Process each article
        const processedArticles = await Promise.all(
            data.articles.map(async (article: any) => {
                try {
                    // Basic article structure
                    const processedArticle = {
                        title: article.title || 'No title',
                        description: article.description || 'No description',
                        url: article.url || '#',
                        source: article.source?.name || 'Unknown source',
                        publishedAt: article.publishedAt || new Date().toISOString(),
                        impact: 'Medium',
                        sector: 'General',
                        analysis: {
                            keyInsights: ['Analysis pending'],
                            implications: {
                                shortTerm: 'Analysis pending',
                                longTerm: 'Analysis pending'
                            },
                            relevanceScore: 5,
                            workforceTrends: []
                        }
                    }

                    // Try to get AI analysis
                    try {
                        const analysis = await analyzeArticle(article)
                        if (analysis) {
                            processedArticle.impact = analysis.impact
                            processedArticle.sector = analysis.sector
                            processedArticle.analysis = {
                                keyInsights: analysis.keyInsights,
                                implications: analysis.implications,
                                relevanceScore: analysis.relevanceScore,
                                workforceTrends: analysis.workforceTrends
                            }
                        }
                    } catch (aiError) {
                        console.error('AI analysis error:', aiError)
                        // Continue with default analysis if AI fails
                    }

                    return processedArticle

                } catch (articleError) {
                    console.error('Article processing error:', articleError)
                    return null
                }
            })
        )

        // Filter out any failed articles
        const validArticles = processedArticles.filter(article => article !== null)

        res.status(200).json(validArticles)

    } catch (error) {
        console.error('API Error:', error)
        res.status(500).json({ error: 'Failed to fetch news' })
    }
}

async function analyzeArticle(article: any) {
    const prompt = `
Analyze this workforce-related news article:

Title: ${article.title}
Description: ${article.description}
Source: ${article.source?.name}

Provide a JSON response with:
{
    "impact": "High/Medium/Low",
    "sector": "Technology/Healthcare/Finance/Professional Services/Manufacturing/General",
    "keyInsights": ["insight1", "insight2"],
    "implications": {
        "shortTerm": "short term impact",
        "longTerm": "long term impact"
    },
    "relevanceScore": 1-10,
    "workforceTrends": ["trend1", "trend2"]
}
`

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are an expert analyst specializing in workforce solutions and recruitment industry trends."
            },
            { role: "user", content: prompt }
        ],
        model: "gpt-3.5-turbo",
        temperature: 0.3,
    })

    try {
        return JSON.parse(completion.choices[0].message.content || '{}')
    } catch (error) {
        console.error('AI response parsing error:', error)
        return null
    }
}
