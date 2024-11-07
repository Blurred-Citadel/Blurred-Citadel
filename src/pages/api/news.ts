import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const NEWS_API_KEY = process.env.NEWS_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

// Add debug logging
console.log('API Keys present:', {
  newsApi: !!NEWS_API_KEY,
  openAi: !!OPENAI_API_KEY
});

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
      `pageSize=5&` + // Reduced to 5 for testing
      `apiKey=${NEWS_API_KEY}`
    )

    const data = await response.json()
    console.log('News API Response:', {
      status: response.status,
      articleCount: data.articles?.length
    });

    // Format and analyze each article
    const analysisPromises = data.articles.map(async (article: any) => {
      try {
        // Prepare content for analysis
        const content = `
Title: ${article.title}
Description: ${article.description}
Source: ${article.source.name}
        `

        console.log('Analyzing article:', article.title);
        // Get AI analysis
        const analysis = await analyzeWithAI(content)
        console.log('Analysis complete for:', article.title);

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
      } catch (articleError) {
        console.error('Error processing article:', article.title, articleError);
        throw articleError;
      }
    })

    const analyzedNews = await Promise.all(analysisPromises)
    res.status(200).json(analyzedNews)

  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ 
      error: 'Failed to process news',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

async function analyzeWithAI(content: string) {
  try {
    console.log('Starting AI analysis');
    const prompt = `
Analyze this workforce-related news article and provide structured insights:

${content}

Provide analysis in the following JSON format:
{
  "impact": "High/Medium/Low",
  "sector": "string",
  "keyInsights": ["string"],
  "implications": {
    "shortTerm": "string",
    "longTerm": "string"
  },
  "relevanceScore": number,
  "workforceTrends": ["string"]
}

Focus on workforce solutions industry impact and implications.
`

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are an expert analyst specializing in workforce solutions, recruitment, and labor markets." },
        { role: "user", content: prompt }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.3,
    });

    console.log('OpenAI response received');

    // Parse the AI response
    const analysisText = completion.choices[0].message.content || '{}'
    console.log('AI response:', analysisText);
    
    const analysis = JSON.parse(analysisText)
    return analysis;

  } catch (error) {
    console.error('AI Analysis Error:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    throw error; // Re-throw to be handled by the caller
  }
}
