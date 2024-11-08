import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

// Existing types remain the same
type NewsApiArticle = {
    title: string;
    description: string;
    url: string;
    source: {
        name: string;
    };
    publishedAt: string;
}

type ProcessedArticle = {
    title: string;
    description: string;
    url: string;
    source: string;
    publishedAt: string;
    impact: string;
    sector: string;
    analysis: {
        keyInsights: string[];
        implications: {
            shortTerm: string;
            longTerm: string;
        };
        relevanceScore: number;
        workforceTrends: string[];
    };
}

async function analyzeWithAI(article: NewsApiArticle, category: string) {
    try {
        const prompt = `
Analyze this workforce industry news article from a staffing/recruitment industry perspective:

Title: ${article.title}
Description: ${article.description}
Category Focus: ${category}

Provide a structured analysis in JSON format focusing on the staffing industry implications. Include:

{
    "impact": "High/Medium/Low", // Based on significance to staffing/recruitment industry
    "sector": string, // Primary sector affected: Technology, Healthcare, Finance, Manufacturing, Professional Services, Engineering, or Cross-Industry
    "keyInsights": [
        // 2-3 most important insights for staffing industry professionals
    ],
    "implications": {
        "shortTerm": "string", // Immediate impact on staffing/recruitment businesses
        "longTerm": "string"  // Long-term strategic implications
    },
    "relevanceScore": number, // 1-10 rating for relevance to staffing industry (10 highest)
    "workforceTrends": [
        // 2-3 specific workforce trends identified
    ]
}

Focus your analysis on:
- Direct implications for staffing/recruitment businesses
- Client industry impacts
- Changes in workforce demands
- Market opportunities for staffing providers
- Skills and talent implications
- Strategic considerations for workforce solutions providers

Be specific and practical in your insights.`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106",
            messages: [
                {
                    role: "system",
                    content: "You are an expert analyst specializing in workforce solutions, staffing industry, and recruitment markets. Focus on practical implications for staffing industry professionals."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        // Parse the AI response
        const analysis = JSON.parse(response.choices[0].message.content);
        return analysis;

    } catch (error) {
        console.error('AI Analysis Error:', error);
        return null;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { category = 'all', region = 'global' } = req.query;
        
        // Rest of the existing news fetching code remains the same until the article processing...

        const articles = await Promise.all(data.articles
            .filter((article: NewsApiArticle) => 
                article.title && 
                article.description && 
                article.url && 
                !article.title.includes('Removed') && 
                !article.title.includes('[Removed]')
            )
            .slice(0, 12) // Take only top 12 articles before AI analysis
            .map(async (article: NewsApiArticle): Promise<ProcessedArticle> => {
                const aiAnalysis = await analyzeWithAI(article, category as string);
                
                return {
                    title: article.title,
                    description: article.description,
                    url: article.url,
                    source: article.source?.name || 'Unknown',
                    publishedAt: article.publishedAt,
                    impact: aiAnalysis?.impact || determineImpact(article),
                    sector: aiAnalysis?.sector || determineSector(article, category as string),
                    analysis: {
                        keyInsights: aiAnalysis?.keyInsights || generateDefaultInsights(category as string),
                        implications: {
                            shortTerm: aiAnalysis?.implications.shortTerm || 'Analysis in progress',
                            longTerm: aiAnalysis?.implications.longTerm || 'Analysis in progress'
                        },
                        relevanceScore: aiAnalysis?.relevanceScore || 5,
                        workforceTrends: aiAnalysis?.workforceTrends || generateDefaultTrends(category as string)
                    }
                };
            }));

        res.status(200).json(articles);

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
}

// Keep the existing helper functions (determineImpact, determineSector, etc.)
// Add these new helper functions:

function generateDefaultInsights(category: string): string[] {
    return [
        'Market conditions are evolving',
        'Industry adaptation required'
    ];
}

function generateDefaultTrends(category: string): string[] {
    return [
        'Workforce Evolution',
        'Digital Transformation'
    ];
}

// ... (rest of the existing helper functions)
