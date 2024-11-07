import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const NEWS_API_KEY = process.env.NEWS_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

// More focused workforce solutions keywords
const keywords = [
    // Staffing Industry Terms
    '"workforce solutions"',
    '"staffing industry"',
    '"recruitment sector"',
    '"talent acquisition"',
    '"contingent workforce"',
    
    // Workforce Trends
    '"skills shortage"',
    '"labor market"',
    '"workforce trends"',
    '"talent pipeline"',
    '"workforce management"',
    
    // Business Impact
    '"hiring trends"',
    '"workforce planning"',
    '"talent strategy"',
    '"labor costs"',
    '"staff turnover"'
].join(' OR ');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const response = await fetch(
            `https://newsapi.org/v2/everything?` +
            `q=${encodeURIComponent(keywords)}&` +
            `language=en&` +
            `sortBy=relevancy&` +
            `pageSize=12&` +
            `excludeDomains=youtube.com,facebook.com&` +
            `apiKey=${NEWS_API_KEY}`
        )

        const data = await response.json()

        // Filter out job postings and irrelevant content
        const filteredArticles = data.articles.filter((article: any) => {
            const text = `${article.title} ${article.description}`.toLowerCase();
            return !text.includes('job posting') && 
                   !text.includes('position available') &&
                   !text.includes('apply now') &&
                   !text.includes('sponsored content');
        });

        const processedArticles = await Promise.all(
            filteredArticles.map(async (article: any) => {
                try {
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
                    }

                    return processedArticle

                } catch (articleError) {
                    console.error('Article processing error:', articleError)
                    return null
                }
            })
        )

        // Filter out failed articles and sort by relevance
        const validArticles = processedArticles
            .filter(article => article !== null)
            .sort((a: any, b: any) => 
                (b?.analysis?.relevanceScore || 0) - (a?.analysis?.relevanceScore || 0)
            );

        res.status(200).json(validArticles)

    } catch (error) {
        console.error('API Error:', error)
        res.status(500).json({ error: 'Failed to fetch news' })
    }
}

async function analyzeArticle(article: any) {
    const prompt = `
Analyze this workforce solutions industry news article from a staffing industry perspective:

Title: ${article.title}
Description: ${article.description}
Source: ${article.source?.name}

Provide a detailed analysis in JSON format focusing on staffing industry implications. Response format:
{
    "impact": "High/Medium/Low", // Based on significance to staffing/recruitment industry
    "sector": "string", // Choose the most relevant: "IT/Tech", "Healthcare", "Professional Services", "Manufacturing", "Finance", "Engineering", "Cross-Industry"
    "keyInsights": [ // 2-3 key takeaways specifically for staffing industry professionals
        "string",
        "string"
    ],
    "implications": {
        "shortTerm": "string", // Immediate impact on staffing/recruitment businesses
        "longTerm": "string"  // Long-term industry implications
    },
    "relevanceScore": number, // Rate 1-10 for relevance to staffing industry (10 being highest)
    "workforceTrends": [ // 2-3 specific workforce trends identified
        "string",
        "string"
    ]
}

Focus on:
- Direct implications for staffing/recruitment businesses
- Client industry impacts
- Changes in workforce demands
- Market opportunities for staffing providers
- Skills and talent implications
`

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are a senior analyst specializing in the workforce solutions and staffing industry. Provide practical, business-focused analysis for staffing industry professionals."
            },
            { role: "user", content: prompt }
        ],
        model: "gpt-3.5-turbo",
        temperature: 0.3,
    })

    try {
        const analysis = JSON.parse(completion.choices[0].message.content || '{}')
        
        // Validate and clean analysis
        return {
            impact: ['High', 'Medium', 'Low'].includes(analysis.impact) ? analysis.impact : 'Medium',
            sector: analysis.sector || 'Cross-Industry',
            keyInsights: Array.isArray(analysis.keyInsights) ? analysis.keyInsights.slice(0, 3) : ['Analysis unavailable'],
            implications: {
                shortTerm: analysis.implications?.shortTerm || 'Analysis unavailable',
                longTerm: analysis.implications?.longTerm || 'Analysis unavailable'
            },
            relevanceScore: Number.isInteger(analysis.relevanceScore) ? 
                Math.min(Math.max(analysis.relevanceScore, 1), 10) : 5,
            workforceTrends: Array.isArray(analysis.workforceTrends) ? 
                analysis.workforceTrends.slice(0, 3) : []
        }
    } catch (error) {
        console.error('AI response parsing error:', error)
        return null
    }
}
