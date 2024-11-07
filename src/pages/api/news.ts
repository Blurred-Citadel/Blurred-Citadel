import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const NEWS_API_KEY = process.env.NEWS_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

// Category-specific keywords
const CATEGORY_KEYWORDS = {
    ai: 'artificial intelligence OR machine learning OR automation OR AI recruitment OR AI staffing',
    labor: 'labor market OR employment trends OR workforce dynamics OR job market',
    msp: 'managed service provider OR RPO OR recruitment process outsourcing OR workforce solutions',
    stem: 'engineering jobs OR technology recruitment OR science recruitment OR STEM careers',
    chomsky: 'workforce inequality OR labor rights OR corporate influence OR worker exploitation',
    all: 'workforce OR recruitment OR staffing OR employment'
};

// Region-specific parameters
const REGION_PARAMS = {
    uk: 'country=gb',
    usa: 'country=us',
    eu: 'domains=ft.com,reuters.com,bloomberg.com,euronews.com',
    global: ''
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { category = 'all', region = 'global' } = req.query;
        
        // Get keywords for selected category
        const keywords = CATEGORY_KEYWORDS[category as keyof typeof CATEGORY_KEYWORDS] || CATEGORY_KEYWORDS.all;
        
        // Get region parameter
        const regionParam = REGION_PARAMS[region as keyof typeof REGION_PARAMS] || '';

        // Construct API URL
        const apiUrl = `https://newsapi.org/v2/everything?` +
            `q=${encodeURIComponent(keywords)}&` +
            `language=en&` +
            `sortBy=relevancy&` +
            `pageSize=12&` +
            (regionParam ? `&${regionParam}` : '') +
            `&apiKey=${NEWS_API_KEY}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.articles || !Array.isArray(data.articles)) {
            throw new Error('Invalid response from NewsAPI');
        }

        // Process the articles
        const processedArticles = await Promise.all(
            data.articles.map(async (article: any) => {
                try {
                    const analysis = await analyzeArticle(article);
                    return {
                        title: article.title || 'No title',
                        description: article.description || 'No description',
                        url: article.url || '#',
                        source: article.source?.name || 'Unknown source',
                        publishedAt: article.publishedAt || new Date().toISOString(),
                        impact: analysis?.impact || 'Medium',
                        sector: analysis?.sector || 'General',
                        analysis: analysis ? {
                            keyInsights: analysis.keyInsights,
                            implications: analysis.implications,
                            relevanceScore: analysis.relevanceScore,
                            workforceTrends: analysis.workforceTrends
                        } : undefined
                    };
                } catch (error) {
                    console.error('Error processing article:', error);
                    return null;
                }
            })
        );

        const validArticles = processedArticles.filter(article => article !== null);
        res.status(200).json(validArticles);

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
}

async function analyzeArticle(article: any) {
    const prompt = `
Analyze this workforce-related news article:

Title: ${article.title}
Description: ${article.description}
Source: ${article.source?.name}

Provide a JSON response with:
{
    "impact": "High/Medium/Low",
    "sector": "Technology/Healthcare/Finance/Professional Services/Manufacturing/General",
    "keyInsights": ["insight1", "insight2"],
    "implications": {
        "shortTerm": "short term impact",
        "longTerm": "long term impact"
    },
    "relevanceScore": 1-10,
    "workforceTrends": ["trend1", "trend2"]
}
`

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are an expert analyst specializing in workforce solutions and recruitment industry trends."
            },
            { role: "user", content: prompt }
        ],
        model: "gpt-3.5-turbo",
        temperature: 0.3,
    });

    try {
        return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
        console.error('AI response parsing error:', error);
        return null;
    }
}
