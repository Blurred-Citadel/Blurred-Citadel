import type { NextApiRequest, NextApiResponse } from 'next'

const NEWS_API_KEY = process.env.NEWS_API_KEY;

// Extended timeout for the API
export const config = {
    api: {
        responseLimit: false,
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { category = 'all', region = 'global' } = req.query;
        
        // More targeted keywords for each category
        const categoryKeywords = {
            ai: 'artificial intelligence recruitment OR ai hiring trends OR automation workforce',
            labor: '"labor market" OR "employment trends" OR "workforce statistics"',
            msp: '"managed service provider" OR "recruitment process outsourcing" OR MSP staffing',
            stem: '"STEM recruitment" OR "engineering talent" OR "technology staffing"',
            chomsky: '"workforce inequality" OR "labor rights" OR "worker conditions"',
            all: 'workforce solutions OR recruitment trends OR employment',
        };

        // Get keywords for selected category
        const keywords = categoryKeywords[category as keyof typeof categoryKeywords] || categoryKeywords.all;

        // Base query parameters
        const queryParams = new URLSearchParams({
            apiKey: NEWS_API_KEY,
            language: 'en',
            sortBy: 'relevancy',
            pageSize: '20', // Fetch more to filter for relevance
        });

        // Region-specific handling
        let baseUrl = 'https://newsapi.org/v2/everything';
        if (region !== 'global') {
            switch(region) {
                case 'uk':
                    queryParams.append('domains', 'bbc.co.uk,theguardian.com,telegraph.co.uk,ft.com');
                    break;
                case 'usa':
                    queryParams.append('domains', 'wsj.com,nytimes.com,bloomberg.com,reuters.com');
                    break;
                case 'eu':
                    queryParams.append('domains', 'euronews.com,politico.eu,ft.com,reuters.com');
                    break;
            }
        }

        queryParams.append('q', keywords);

        const apiUrl = `${baseUrl}?${queryParams.toString()}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`NewsAPI error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.articles || !Array.isArray(data.articles)) {
            throw new Error('Invalid response format from NewsAPI');
        }

        // Process and filter articles
        const articles = data.articles
            .filter(article => 
                article.title && 
                article.description && 
                article.url && 
                !article.title.includes('Removed') && 
                !article.title.includes('[Removed]')
            )
            .map(article => ({
                title: article.title,
                description: article.description,
                url: article.url,
                source: article.source?.name || 'Unknown',
                publishedAt: article.publishedAt,
                impact: determineImpact(article),
                sector: determineSector(article, category as string),
                analysis: generateAnalysis(article, category as string)
            }))
            .slice(0, 12); // Take the top 12 most relevant articles

        res.status(200).json(articles);

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
}

function determineImpact(article: any): string {
    const text = `${article.title} ${article.description}`.toLowerCase();
    const highImpactTerms = ['major', 'significant', 'breakthrough', 'critical', 'urgent'];
    const mediumImpactTerms = ['new', 'update', 'change', 'develop'];

    if (highImpactTerms.some(term => text.includes(term))) return 'High';
    if (mediumImpactTerms.some(term => text.includes(term))) return 'Medium';
    return 'Low';
}

function determineSector(article: any, category: string): string {
    const text = `${article.title} ${article.description}`.toLowerCase();
    
    const sectorMap = {
        'technology': ['tech', 'digital', 'software', 'ai', 'automation'],
        'healthcare': ['health', 'medical', 'healthcare'],
        'finance': ['banking', 'financial', 'finance'],
        'professional services': ['consulting', 'services', 'professional'],
        'manufacturing': ['manufacturing', 'industrial'],
        'engineering': ['engineering', 'construction']
    };

    for (const [sector, keywords] of Object.entries(sectorMap)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            return sector.charAt(0).toUpperCase() + sector.slice(1);
        }
    }

    return 'General';
}

function generateAnalysis(article: any, category: string) {
    const text = `${article.title} ${article.description}`.toLowerCase();
    
    // Generate relevant insights based on category
    const insights = [
        generatePrimaryInsight(text, category),
        generateSecondaryInsight(text, category)
    ].filter(Boolean);

    return {
        keyInsights: insights,
        implications: {
            shortTerm: generateShortTermImplication(text, category),
            longTerm: generateLongTermImplication(text, category)
        },
        relevanceScore: calculateRelevanceScore(text, category),
        workforceTrends: generateTrends(text, category)
    };
}

function generatePrimaryInsight(text: string, category: string): string {
    switch(category) {
        case 'ai':
            return 'Impact on automation and recruitment processes';
        case 'labor':
            return 'Shifting workforce dynamics and market conditions';
        case 'msp':
            return 'Evolution of managed service delivery models';
        case 'stem':
            return 'Technical talent market developments';
        case 'chomsky':
            return 'Workplace dynamics and labor relations';
        default:
            return 'General workforce market developments';
    }
}

function generateSecondaryInsight(text: string, category: string): string {
    if (text.includes('remote')) return 'Remote work implications';
    if (text.includes('skill')) return 'Skills gap and training needs';
    if (text.includes('demand')) return 'Changes in market demand';
    return 'Industry adaptation requirements';
}

function generateShortTermImplication(text: string, category: string): string {
    switch(category) {
        case 'ai':
            return 'Immediate review of AI integration opportunities';
        case 'labor':
            return 'Short-term workforce strategy adjustment needed';
        case 'msp':
            return 'Service delivery optimization required';
        case 'stem':
            return 'Technical recruitment strategy adaptation';
        default:
            return 'Market position review recommended';
    }
}

function generateLongTermImplication(text: string, category: string): string {
    switch(category) {
        case 'ai':
            return 'Strategic AI implementation planning required';
        case 'labor':
            return 'Long-term workforce planning implications';
        case 'msp':
            return 'Service model evolution necessary';
        case 'stem':
            return 'Technical talent pipeline development needed';
        default:
            return 'Strategic planning adjustment recommended';
    }
}

function calculateRelevanceScore(text: string, category: string): number {
    let score = 5;
    const relevantTerms = getCategoryRelevantTerms(category);
    
    relevantTerms.forEach(term => {
        if (text.includes(term)) score += 1;
    });
    
    return Math.min(Math.max(score, 1), 10);
}

function getCategoryRelevantTerms(category: string): string[] {
    switch(category) {
        case 'ai':
            return ['artificial intelligence', 'machine learning', 'automation', 'ai'];
        case 'labor':
            return ['workforce', 'employment', 'labor', 'jobs'];
        case 'msp':
            return ['managed service', 'outsourcing', 'staffing'];
        case 'stem':
            return ['engineering', 'technical', 'technology'];
        case 'chomsky':
            return ['rights', 'conditions', 'equality'];
        default:
            return ['workforce', 'recruitment', 'employment'];
    }
}

function generateTrends(text: string, category: string): string[] {
    const trends = new Set<string>();
    
    // Add category-specific trends
    switch(category) {
        case 'ai':
            trends.add('AI in Recruitment');
            break;
        case 'labor':
            trends.add('Workforce Evolution');
            break;
        case 'msp':
            trends.add('Service Delivery Innovation');
            break;
        case 'stem':
            trends.add('Technical Talent Demands');
            break;
        case 'chomsky':
            trends.add('Workplace Rights');
            break;
    }
    
    // Add context-based trends
    if (text.includes('remote')) trends.add('Remote Work');
    if (text.includes('digital')) trends.add('Digital Transformation');
    if (text.includes('skill')) trends.add('Skills Gap');

    return Array.from(trends).slice(0, 3);
}
