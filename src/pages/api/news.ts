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

        console.log('Fetching from NewsAPI:', apiUrl.replace(NEWS_API_KEY || '', '[API_KEY]'));

        const response = await fetch(apiUrl);
        console.log('NewsAPI response status:', response.status);

        if (!response.ok) {
            throw new Error(`NewsAPI error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.articles || !Array.isArray(data.articles)) {
            throw new Error('Invalid response format from NewsAPI');
        }

        const articles = data.articles
            .filter((article: NewsApiArticle) => 
                article.title && 
                article.description && 
                article.url && 
                !article.title.includes('Removed') && 
                !article.title.includes('[Removed]')
            )
            .slice(0, 12);

        console.log(`Processing ${articles.length} articles`);

        const processedArticles = await Promise.all(
            articles.map(async (article: NewsApiArticle): Promise<ProcessedArticle> => {
                console.log('Processing article:', article.title);
                let aiAnalysis = null;
                
                try {
                    aiAnalysis = await analyzeWithAI(article, categoryParam);
                } catch (error) {
                    console.error('Error analyzing article:', article.title, error);
                }

                return {
                    title: article.title,
                    description: article.description,
                    url: article.url,
                    source: article.source?.name || 'Unknown',
                    publishedAt: article.publishedAt,
                    impact: aiAnalysis?.impact || determineSector(article, categoryParam),
                    sector: aiAnalysis?.sector || determineSector(article, categoryParam),
                    analysis: {
                        keyInsights: aiAnalysis?.keyInsights || generateInsights(categoryParam),
                        implications: {
                            shortTerm: aiAnalysis?.implications?.shortTerm || 'Analysis in progress',
                            longTerm: aiAnalysis?.implications?.longTerm || 'Analysis in progress'
                        },
                        relevanceScore: aiAnalysis?.relevanceScore || 5,
                        workforceTrends: aiAnalysis?.workforceTrends || generateTrends(categoryParam)
                    }
                };
            })
        );

        res.status(200).json(processedArticles);

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch news',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

async function analyzeWithAI(article: NewsApiArticle, category: string): Promise<AIAnalysisResponse | null> {
    try {
        const prompt = `
Analyze this workforce industry news article:

Title: ${article.title}
Description: ${article.description}
Category: ${category}

Provide analysis in JSON format:
{
    "impact": "High/Medium/Low",
    "sector": "Technology/Healthcare/Finance/Manufacturing/Professional Services/Engineering/Cross-Industry",
    "keyInsights": ["insight1", "insight2"],
    "implications": {
        "shortTerm": "immediate impact",
        "longTerm": "long term impact"
    },
    "relevanceScore": 8,
    "workforceTrends": ["trend1", "trend2"]
}`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an expert analyst specializing in workforce solutions and recruitment industry trends."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
        });

        console.log('Received AI response for:', article.title);

        const content = completion.choices[0].message.content;
        if (!content) {
            throw new Error('Empty response from OpenAI');
        }

        return JSON.parse(content) as AIAnalysisResponse;

    } catch (error) {
        console.error('AI Analysis Error:', error);
        return null;
    }
}

function determineSector(article: NewsApiArticle, category: string): string {
    const text = `${article.title} ${article.description}`.toLowerCase();
    
    if (category === 'ai') return 'Technology';
    if (category === 'stem') {
        if (text.includes('engineering')) return 'Engineering';
        if (text.includes('tech')) return 'Technology';
        return 'STEM';
    }
    
    const sectorMap = {
        'Technology': ['tech', 'digital', 'software', 'ai', 'automation'],
        'Healthcare': ['health', 'medical', 'healthcare'],
        'Finance': ['banking', 'financial', 'finance'],
        'Manufacturing': ['manufacturing', 'industrial'],
        'Professional Services': ['consulting', 'professional services'],
        'Engineering': ['engineering', 'construction']
    };

    for (const [sector, keywords] of Object.entries(sectorMap)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            return sector;
        }
    }

    return 'Cross-Industry';
}

function generateInsights(category: string): string[] {
    const insights = {
        ai: ['AI impact on recruitment', 'Automation trends in staffing'],
        labor: ['Labor market shifts', 'Employment trend analysis'],
        msp: ['MSP service evolution', 'Workforce solution developments'],
        stem: ['Technical talent demands', 'STEM recruitment challenges'],
        default: ['Market development analysis', 'Industry trend assessment']
    };

    return insights[category as keyof typeof insights] || insights.default;
}

function generateTrends(category: string): string[] {
    const trends = {
        ai: ['AI in Recruitment', 'Automation Integration'],
        labor: ['Workforce Evolution', 'Employment Patterns'],
        msp: ['Service Innovation', 'Solution Development'],
        stem: ['Technical Demands', 'Skill Requirements'],
        default: ['Market Evolution', 'Industry Development']
    };

    return trends[category as keyof typeof trends] || trends.default;
}
