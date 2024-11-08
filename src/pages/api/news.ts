// ... (previous code remains the same until the handler function)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // Fix type handling for query parameters
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

        res.status(200).json(articles);

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
}

// ... (rest of the code remains the same)
