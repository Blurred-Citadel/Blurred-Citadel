import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const NEWS_API_KEY = process.env.NEWS_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

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

    // Format and analyze each article
    const analysisPromises = data.articles.map(async (article: any) => {
      // Prepare content for analysis
      const content = `
Title: ${article.title}
Description: ${article.description}
Content: ${article.content || article.description}
Source: ${article.source.name}
      `

      // Get AI analysis
      const analysis = await analyzeWithAI(content)

      return {
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        impact: analysis.impact,
        sector: analysis.sector,
        analysis: {
          keyInsights: analysis.keyInsights,
          implications: analysis.implications,
          relevanceScore: analysis.relevanceScore,
          workforceTrends: analysis.workforceTrends
        }
      }
    })

    const analyzedNews = await Promise.all(analysisPromises)
    res.status(200).json(analyzedNews)

  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'Failed to process news' })
  }
}

async function analyzeWithAI(content: string) {
  try {
    const prompt = `
Analyze this workforce-related news article and provide structured insights:

${content}

Provide analysis in the following JSON format:
{
  "impact": "High/Medium/Low", // Based on potential impact on workforce/recruitment industry
  "sector": "string", // Main sector affected
  "keyInsights": ["string"], // 2-3 main takeaways
  "implications": {
    "shortTerm": "string",
    "longTerm": "string"
  },
  "relevanceScore": number, // 1-10 rating for relevance to workforce solutions
  "workforceTrends": ["string"] // 2-3 workforce trends identified
}

Focus on:
- Impact on workforce/staffing industry
- Recruitment implications
- Labor market trends
- Skills and talent implications
- Business transformation effects
`

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are an expert analyst specializing in workforce solutions, recruitment, and labor markets." },
        { role: "user", content: prompt }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.3,
    });

    // Parse the AI response
    const analysisText = completion.choices[0].message.content || '{}'
    const analysis = JSON.parse(analysisText)

    return {
      impact: analysis.impact || 'Medium',
      sector: analysis.sector || 'General',
      keyInsights: analysis.keyInsights || [],
      implications: analysis.implications || { shortTerm: '', longTerm: '' },
      relevanceScore: analysis.relevanceScore || 5,
      workforceTrends: analysis.workforceTrends || []
    }

  } catch (error) {
    console.error('AI Analysis Error:', error)
    return {
      impact: 'Medium',
      sector: 'General',
      keyInsights: ['Analysis unavailable'],
      implications: { shortTerm: 'Analysis unavailable', longTerm: 'Analysis unavailable' },
      relevanceScore: 5,
      workforceTrends: []
    }
  }
}
