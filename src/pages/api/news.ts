import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

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

type AIAnalysisResponse = {
    impact: string;
    sector: string;
    keyInsights: string[];
    implications: {
        shortTerm: string;
        longTerm: string;
    };
    relevanceScore: number;
    workforceTrends: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        console.log('Starting API request with params:', {
            category: req.query.category,
            region: req.query.region
        });

        const categoryParam = Array.isArray(req.query.category) 
            ? req.query.category[0] 
            : req.query.category || 'all';
            
        const regionParam = Array.isArray(req.query.region)
            ? req.query.region[0]
            : req.query.region || 'global';

        console.log('Processed params:', { categoryParam, regionParam });
        
        const categoryKeywords = {
            ai: 'artificial intelligence recruitment OR ai hiring trends OR automation workforce',
            labor: '"labor market" OR "employment trends" OR "workforce statistics"',
            msp: '"managed service provider" OR "recruitment process outsourcing" OR MSP staffing',
            stem: '"STEM recruitment" OR "engineering talent" OR "technology staffing"',
            chomsky: '"workforce inequality" OR "labor rights" OR "worker conditions"',
            all: 'workforce solutions OR recruitment trends OR employment',
        };

        const keywords = categoryKeywords[categoryParam as keyof typeof categoryKeywords] || categoryKeywords.all;

        let apiUrl = 'https://newsapi.org/v2/everything?';
        apiUrl += `q=${encodeURIComponent(keywords)}`;
        apiUrl += `&language=en`;
        apiUrl += `&sortBy=relevancy`;
        apiUrl += `&pageSize=20`;
        
        if (regionParam !== 'global') {
            switch(regionParam) {
                case 'uk':
                    apiUrl += `&domains=bbc.co.uk,theguardian.com,telegraph.co.uk,ft.com`;
                    break;
                case 'usa':
                    apiUrl += `&domains=wsj.com,nytimes.com,bloomberg.com,reuters.com`;
                    break;
                case 'eu':
                    apiUrl += `&domains=euronews.com,politico.eu,ft.com,reuters.com`;
                    break;
            }
        }

        apiUrl += `&apiKey=${NEWS_API_KEY}`;
        
        console.log('Fetching from NewsAPI:', apiUrl.replace(NEWS_API_KEY!, '[API_KEY]'));

        const response = await fetch(apiUrl);
        console.log('NewsAPI response status:', response.status);

        if (!response.ok) {
            throw new Error(`NewsAPI error: ${response.status} - ${await response.text()}`);
        }

        const data = await response.json();
        console.log('NewsAPI response received:', {
            status: response.status,
            articleCount: data.articles?.length || 0
        });

        if (!data.articles || !Array.isArray(data.articles)) {
            throw new Error('Invalid response format from NewsAPI');
        }

        console.log('Starting to process articles...');

        const articles = await Promise.all(
            data.articles
                .filter((article: NewsApiArticle) => 
                    article.title && 
                    article.description && 
                    article.url && 
                    !article.title.includes('Removed') && 
                    !article.title.includes('[Removed]')
                )
                .slice(0, 12)
                .map(async (article: NewsApiArticle): Promise<ProcessedArticle> => {
                    console.log('Processing article:', article.title);
                    const aiAnalysis = await analyzeWithAI(article, categoryParam);
                    
                    return {
                        title: article.title,
                        description: article.description,
                        url: article.url,
                        source: article.source?.name || 'Unknown',
                        publishedAt: article.publishedAt,
                        impact: aiAnalysis?.impact || 'Medium',
                        sector: aiAnalysis?.sector || determineSector(article, categoryParam),
                        analysis: {
                            keyInsights: aiAnalysis?.keyInsights || generateCategorySpecificInsights(article, categoryParam),
                            implications: {
                                shortTerm: aiAnalysis?.implications?.shortTerm || generateShortTermImplication(article, categoryParam),
                                longTerm: aiAnalysis?.implications?.longTerm || generateLongTermImplication(article, categoryParam)
                            },
                            relevanceScore: aiAnalysis?.relevanceScore || 5,
                            workforceTrends: aiAnalysis?.workforceTrends || generateCategorySpecificTrends(article, categoryParam)
                        }
                    };
                })
        );

        console.log('Successfully processed articles:', articles.length);
        res.status(200).json(articles);

    } catch (error) {
        console.error('Full API Error:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace'
        });
        res.status(500).json({ 
            error: 'Failed to fetch news',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

async function analyzeWithAI(article: NewsApiArticle, category: string): Promise<AIAnalysisResponse | null> {
    try {
        console.log('Starting AI analysis for:', article.title);
        const prompt = `
As a staffing industry expert, analyze this workforce-related news article:

TITLE: ${article.title}
DESCRIPTION: ${article.description}
CATEGORY: ${category}

Provide a detailed analysis specifically for staffing industry professionals in this exact JSON format:
{
    "impact": "High/Medium/Low",
    "sector": "Technology/Healthcare/Finance/Manufacturing/Professional Services/Engineering/Cross-Industry",
    "keyInsights": [
        "First key insight with specific details",
        "Second key insight with specific details",
        "Third key insight with specific details"
    ],
    "implications": {
        "shortTerm": "Detailed description of immediate implications for staffing firms (next 3-6 months)",
        "longTerm": "Detailed description of long-term strategic implications (12-24 months)"
    },
    "relevanceScore": 8,
    "workforceTrends": [
        "First specific trend identified",
        "Second specific trend identified",
        "Third specific trend identified"
    ]
}

Consider:
1. Immediate impact on staffing/recruitment operations
2. Changes in client hiring patterns
3. Skills and talent implications
4. Market opportunities for staffing providers
5. Competitive considerations
6. Risk factors and mitigation strategies

Ensure all insights and implications are:
- Specific to the staffing industry
- Actionable for staffing professionals
- Based on the actual content of the article
- Detailed and concrete, not generic
`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a senior analyst specializing in workforce solutions and staffing industry trends. Your analyses are specific, actionable, and directly relevant to staffing industry professionals. Avoid generic responses. Base all insights on the specific article content provided."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.5,
        });

        console.log('Received AI response for:', article.title);

        const content = response.choices[0].message.content;
        if (!content) {
            throw new Error('Empty response from OpenAI');
        }

        let analysis = JSON.parse(content) as AIAnalysisResponse;

        // Validate and clean the response
        analysis = {
            impact: analysis.impact || 'Medium',
            sector: analysis.sector || 'Cross-Industry',
            keyInsights: analysis.keyInsights?.slice(0, 3).filter(Boolean) || [],
            implications: {
                shortTerm: analysis.implications?.shortTerm || 'Immediate analysis pending',
                longTerm: analysis.implications?.longTerm || 'Long-term analysis pending'
            },
            relevanceScore: Math.min(Math.max(analysis.relevanceScore || 5, 1), 10),
            workforceTrends: analysis.workforceTrends?.slice(0, 3).filter(Boolean) || []
        };

        console.log('Completed AI analysis for:', article.title);
        return analysis;

    } catch (error) {
        console.error('AI Analysis Error for article:', article.title, error);
        return null;
    }
}

// Rest of the helper functions remain the same...
[Previous helper functions for determineSector, generateCategorySpecificInsights, etc. remain unchanged]
