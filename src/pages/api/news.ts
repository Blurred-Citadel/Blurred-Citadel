import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const NEWS_API_KEY = process.env.NEWS_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!NEWS_API_KEY || !OPENAI_API_KEY) {
    console.error('Missing required API keys');
}

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

// Simplified keywords for testing
const keywords = 'workforce OR recruitment OR staffing OR "talent acquisition"';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        console.log('Fetching news...');
        const response = await fetch(
            `https://newsapi.org/v2/everything?` +
            `q=${encodeURIComponent(keywords)}&` +
            `language=en&` +
            `sortBy=relevancy&` +
            `pageSize=12&` +
            `apiKey=${NEWS_API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`NewsAPI error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.articles || !Array.isArray(data.articles)) {
            throw new Error('Invalid response from NewsAPI');
        }

        console.log(`Found ${data.articles.length} articles`);

        // Process articles with basic error handling
        const processedArticles = await Promise.all(
            data.articles.map(async (article) => {
                try {
                    const analysis = await analyzeWithAI(article);
                    return {
                        title: article.title || 'No title',
                        description: article.description || 'No description',
                        url: article.url || '#',
                        source: article.source?.name || 'Unknown source',
                        publishedAt: article.publishedAt || new Date().toISOString(),
                        impact: analysis.impact || 'Medium',
                        sector: analysis.sector || 'General',
                        analysis: {
                            keyInsights: analysis.keyInsights || [],
                            implications: analysis.implications || {
                                shortTerm: 'Analysis unavailable',
                                longTerm: 'Analysis unavailable'
                            },
                            relevanceScore: analysis.relevanceScore || 5,
                            workforceTrends: analysis.workforceTrends || []
                        }
                    };
                } catch (error) {
                    console.error('Error processing article:', error);
                    // Return a basic article object if analysis fails
                    return {
                        title: article.title || 'No title',
                        description: article.description || 'No description',
                        url: article.url || '#',
                        source: article.source?.name || 'Unknown source',
                        publishedAt: article.publishedAt || new Date().toISOString(),
                        impact: 'Medium',
                        sector: 'General',
                        analysis: {
                            keyInsights: ['Analysis unavailable'],
                            implications: {
                                shortTerm: 'Analysis unavailable',
                                longTerm: 'Analysis unavailable'
                            },
                            relevanceScore: 5,
                            workforceTrends: []
                        }
                    };
                }
            })
        );

        res.status(200).json(processedArticles);

    } catch (error) {
        console.error('Handler error:', error);
        res.status(500).json({
            error: 'Failed to process news',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

async function analyzeWithAI(article: any) {
    try {
        const prompt = `
Analyze this workforce-related news article:

Title: ${article.title}
Description: ${article.description}
Source: ${article.source?.name}

Provide analysis in JSON format focusing on staffing industry implications.
`;

        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert analyst specializing in workforce solutions and staffing industry trends."
                },
                { role: "user", content: prompt }
            ],
            model: "gpt-3.5-turbo",
            temperature: 0.3,
        });

        const analysisText = completion.choices[0].message.content || '{}';
        try {
            return JSON.parse(analysisText);
        } catch (parseError) {
            console.error('Error parsing AI response:', parseError);
            return {
                impact: 'Medium',
                sector: 'General',
                keyInsights: ['Analysis unavailable'],
                implications: {
                    shortTerm: 'Analysis unavailable',
                    longTerm: 'Analysis unavailable'
                },
                relevanceScore: 5,
                workforceTrends: []
            };
        }
    } catch (error) {
        console.error('AI Analysis Error:', error);
        throw error;
    }
}
