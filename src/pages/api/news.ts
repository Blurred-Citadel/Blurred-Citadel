import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

// Type definitions
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
            model: "gpt-4",
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

        // Only return if we have meaningful insights
        if (analysis.keyInsights.length === 0 || 
            analysis.implications.shortTerm === 'Immediate analysis pending' ||
            analysis.workforceTrends.length === 0) {
            
            // Generate category-specific fallback content
            return {
                impact: analysis.impact,
                sector: analysis.sector,
                keyInsights: generateCategorySpecificInsights(article, category),
                implications: {
                    shortTerm: generateShortTermImplication(article, category),
                    longTerm: generateLongTermImplication(article, category)
                },
                relevanceScore: analysis.relevanceScore,
                workforceTrends: generateCategorySpecificTrends(article, category)
            };
        }

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
                        impact: aiAnalysis?.impact || 'Medium',
                        sector: aiAnalysis?.sector || determineSector(article, category as string),
                        analysis: {
                            keyInsights: aiAnalysis?.keyInsights || generateCategorySpecificInsights(article, category),
                            implications: {
                                shortTerm: aiAnalysis?.implications?.shortTerm || generateShortTermImplication(article, category),
                                longTerm: aiAnalysis?.implications?.longTerm || generateLongTermImplication(article, category)
                            },
                            relevanceScore: aiAnalysis?.relevanceScore || 5,
                            workforceTrends: aiAnalysis?.workforceTrends || generateCategorySpecificTrends(article, category)
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

function generateCategorySpecificInsights(article: NewsApiArticle, category: string): string[] {
    const text = `${article.title} ${article.description}`.toLowerCase();
    const insights = [];

    switch(category) {
        case 'ai':
            insights.push('AI technology impact on recruitment processes');
            if (text.includes('automation')) insights.push('Automation affecting hiring workflows');
            if (text.includes('skill')) insights.push('Evolution of technical skill requirements');
            break;
        case 'labor':
            insights.push('Shifting labor market dynamics');
            if (text.includes('remote')) insights.push('Remote work impact on talent acquisition');
            if (text.includes('wage')) insights.push('Compensation trends affecting recruitment');
            break;
        case 'msp':
            insights.push('Changes in managed service delivery models');
            if (text.includes('technology')) insights.push('Technology integration in MSP services');
            if (text.includes('cost')) insights.push('Cost optimization in workforce management');
            break;
        case 'stem':
            insights.push('Technical talent market developments');
            if (text.includes('engineering')) insights.push('Engineering talent demand patterns');
            if (text.includes('skill')) insights.push('STEM skills gap analysis');
            break;
        default:
            insights.push('Workforce solution opportunities identified');
            insights.push('Market adaptation strategies required');
            insights.push('Talent acquisition impact assessment needed');
    }

    return insights.slice(0, 3);
}

function generateShortTermImplication(article: NewsApiArticle, category: string): string {
    const text = `${article.title} ${article.description}`.toLowerCase();
    
    switch(category) {
        case 'ai':
            return text.includes('automation') 
                ? 'Review and update recruitment automation strategies'
                : 'Evaluate AI integration opportunities in recruitment processes';
        case 'labor':
            return text.includes('remote')
                ? 'Adapt recruitment strategies for remote workforce demands'
                : 'Adjust talent acquisition approaches to market changes';
        case 'msp':
            return text.includes('cost')
                ? 'Optimize service delivery cost structures'
                : 'Review and enhance MSP service offerings';
        case 'stem':
            return text.includes('skill')
                ? 'Address immediate technical skills gaps'
                : 'Align recruitment strategies with technical talent demands';
        default:
            return 'Evaluate and adjust current recruitment strategies';
    }
}

function generateLongTermImplication(article: NewsApiArticle, category: string): string {
    switch(category) {
        case 'ai':
            return 'Develop comprehensive AI and automation integration strategy for recruitment processes';
        case 'labor':
            return 'Build adaptive workforce solutions for evolving market conditions';
        case 'msp':
            return 'Transform service delivery models for future market requirements';
        case 'stem':
            return 'Establish sustainable technical talent pipeline development';
        default:
            return 'Develop strategic response to changing market conditions';
    }
}

function generateCategorySpecificTrends(article: NewsApiArticle, category: string): string[] {
    const text = `${article.title} ${article.description}`.toLowerCase();
    const trends = new Set<string>();

    switch(category) {
        case 'ai':
            trends.add('AI in Recruitment Automation');
            break;
        case 'labor':
            trends.add('Workforce Flexibility Evolution');
            break;
        case 'msp':
            trends.add('MSP Service Model Innovation');
            break;
        case 'stem':
            trends.add('Technical Talent Demand Shifts');
            break;
        default:
            trends.add('Recruitment Market Evolution');
    }

    if (text.includes('remote')) trends.add('Remote Work Integration');
    if (text.includes('digital')) trends.add('Digital Transformation');
    if (text.includes('skill')) trends.add('Skills Gap Challenges');
    if (text.includes('tech')) trends.add('Technology Impact');
    if (text.includes('cost')) trends.add('Cost Optimization');
    if (text.includes('talent')) trends.add('Talent Strategy Evolution');

    return Array.from(trends).slice(0, 3);
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
