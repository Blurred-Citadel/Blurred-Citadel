import type { NextApiRequest, NextApiResponse } from 'next'

const NEWS_API_KEY = process.env.NEWS_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { category = 'all', region = 'global' } = req.query;
        
        // Base keywords for different categories
        const categoryKeywords = {
            ai: 'artificial intelligence recruitment OR AI staffing',
            labor: 'labor market OR employment trends',
            msp: 'managed service provider staffing OR recruitment process outsourcing',
            stem: 'STEM recruitment OR technical staffing',
            chomsky: 'workforce rights OR labor conditions',
            all: 'workforce OR recruitment OR staffing'
        };

        // Get keywords for selected category
        const keywords = categoryKeywords[category as keyof typeof categoryKeywords] || categoryKeywords.all;

        // Region-specific parameters
        const regionParam = region === 'uk' ? 'country=gb' 
            : region === 'usa' ? 'country=us'
            : region === 'eu' ? 'country=de,fr,it,es'
            : '';

        // Construct API URL
        let apiUrl = `https://newsapi.org/v2/everything?` +
            `q=${encodeURIComponent(keywords)}&` +
            `language=en&` +
            `sortBy=relevancy&` +
            `pageSize=12`;

        if (regionParam) {
            apiUrl += `&${regionParam}`;
        }

        apiUrl += `&apiKey=${NEWS_API_KEY}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`NewsAPI responded with status: ${response.status}`);
        }

        const data = await response.json();

        // Process articles with basic analysis
        const articles = data.articles.map((article: any) => ({
            title: article.title || 'No title',
            description: article.description || 'No description available',
            url: article.url || '#',
            source: article.source?.name || 'Unknown source',
            publishedAt: article.publishedAt || new Date().toISOString(),
            impact: determineImpact(article.title, article.description),
            sector: determineSector(article.title, article.description),
            analysis: {
                keyInsights: generateInsights(article.description),
                implications: {
                    shortTerm: "Analysis in development",
                    longTerm: "Analysis in development"
                },
                relevanceScore: calculateRelevance(article.title, article.description),
                workforceTrends: identifyTrends(article.description)
            }
        }));

        res.status(200).json(articles);

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch news',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Helper functions for basic analysis
function determineImpact(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('major') || text.includes('significant') || text.includes('dramatic')) {
        return 'High';
    }
    if (text.includes('moderate') || text.includes('potential') || text.includes('could')) {
        return 'Medium';
    }
    return 'Low';
}

function determineSector(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('tech') || text.includes('technology') || text.includes('digital')) {
        return 'Technology';
    }
    if (text.includes('health') || text.includes('medical') || text.includes('healthcare')) {
        return 'Healthcare';
    }
    if (text.includes('finance') || text.includes('banking') || text.includes('financial')) {
        return 'Finance';
    }
    return 'General';
}

function generateInsights(description: string): string[] {
    return ["Market conditions are evolving", "Workforce dynamics are changing"];
}

function calculateRelevance(title: string, description: string): number {
    return 7; // Default relevance score
}

function identifyTrends(description: string): string[] {
    return ["Remote work adoption", "Digital transformation"];
}
