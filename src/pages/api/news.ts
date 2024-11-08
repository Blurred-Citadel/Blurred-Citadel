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

async function analyzeWithAI(article: NewsApiArticle, category: string): Promise<AIAnalysisResponse | null> {
    try {
        const prompt = `
Analyze this workforce industry news article from a staffing/recruitment industry perspective:

Title: ${article.title}
Description: ${article.description}
Category Focus: ${category}

Provide a structured analysis in JSON format focusing on the staffing industry implications. Include:

{
    "impact": "High/Medium/Low",
    "sector": "Technology/Healthcare/Finance/Manufacturing/Professional Services/Engineering/Cross-Industry",
    "keyInsights": ["string", "string"],
    "implications": {
        "shortTerm": "string",
        "longTerm": "string"
    },
    "relevanceScore": 7,
    "workforceTrends": ["string", "string"]
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
            model: "gpt-3.5-turbo",
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
            temperature: 0.7,
        });

        const content = response.choices[0].message.content;
        if (!content) {
            throw new Error('Empty response from OpenAI');
        }

        const analysis = JSON.parse(content) as AIAnalysisResponse;
        return analysis;

    } catch (error) {
        console.error('AI Analysis Error:', error);
        return null;
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { category = 'all', region = 'global' } = req.query;
        
        const categoryKeywords = {
            ai: 'artificial intelligence recruitment OR ai hiring trends OR automation workforce',
            labor: '"labor market" OR "employment trends" OR "workforce statistics"',
            msp: '"managed service provider" OR "recruitment process outsourcing" OR MSP staffing',
            stem: '"STEM recruitment" OR "engineering talent" OR "technology staffing"',
            chomsky: '"workforce inequality" OR "labor rights" OR "worker conditions"',
            all: 'workforce solutions OR recruitment trends OR employment',
        };

        const keywords = categoryKeywords[category as keyof typeof categoryKeywords] || categoryKeywords.all;

        let apiUrl = 'https://newsapi.org/v2/everything?';
        apiUrl += `q=${encodeURIComponent(keywords)}`;
        apiUrl += `&language=en`;
        apiUrl += `&sortBy=relevancy`;
        apiUrl += `&pageSize=20`;
        
        if (region !== 'global') {
            switch(region) {
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

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`NewsAPI error: ${response.status}`);
        }

        const data = await response.json();
        if (!data.articles || !Array.isArray(data.articles)) {
            throw new Error('Invalid response format from NewsAPI');
        }

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
                                shortTerm: aiAnalysis?.implications?.shortTerm || 'Analysis in progress',
                                longTerm: aiAnalysis?.implications?.longTerm || 'Analysis in progress'
                            },
                            relevanceScore: aiAnalysis?.relevanceScore || 5,
                            workforceTrends: aiAnalysis?.workforceTrends || generateDefaultTrends(category as string)
                        }
                    };
                })
        );

        res.status(200).json(articles);

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
}

// Keep existing helper functions
function determineImpact(article: NewsApiArticle): string {
    const text = `${article.title} ${article.description}`.toLowerCase();
    const highImpactTerms = ['major', 'significant', 'breakthrough', 'critical', 'urgent'];
    const mediumImpactTerms = ['new', 'update', 'change', 'develop'];

    if (highImpactTerms.some(term => text.includes(term))) return 'High';
    if (mediumImpactTerms.some(term => text.includes(term))) return 'Medium';
    return 'Low';
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
