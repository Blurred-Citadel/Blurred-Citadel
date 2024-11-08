async function analyzeWithAI(article: NewsApiArticle, category: string): Promise<AIAnalysisResponse | null> {
    try {
        const prompt = `
As a staffing industry expert, analyze this workforce-related news article:

TITLE: ${article.title}
DESCRIPTION: ${article.description}
CATEGORY: ${category}

Provide a detailed analysis specifically for staffing industry professionals in this exact JSON format:
{
    "impact": "High/Medium/Low", // Rate based on significance to staffing/recruitment industry
    "sector": "Technology/Healthcare/Finance/Manufacturing/Professional Services/Engineering/Cross-Industry", // Choose ONE most relevant sector
    "keyInsights": [
        // 3 specific, actionable insights for staffing professionals based on this news
        "First key insight with specific details",
        "Second key insight with specific details",
        "Third key insight with specific details"
    ],
    "implications": {
        "shortTerm": "Detailed description of immediate implications for staffing firms (next 3-6 months)",
        "longTerm": "Detailed description of long-term strategic implications (12-24 months)"
    },
    "relevanceScore": 8, // Rate 1-10 for staffing industry relevance
    "workforceTrends": [
        // 2-3 specific trends identified in the article
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
            model: "gpt-4", // Using GPT-4 for better analysis
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
            temperature: 0.5, // Lower temperature for more focused responses
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

// New helper functions for better fallback content
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

    // Add category-specific trend
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

    // Add context-based trends
    if (text.includes('remote')) trends.add('Remote Work Integration');
    if (text.includes('digital')) trends.add('Digital Transformation');
    if (text.includes('skill')) trends.add('Skills Gap Challenges');
    if (text.includes('tech')) trends.add('Technology Impact');
    if (text.includes('cost')) trends.add('Cost Optimization');
    if (text.includes('talent')) trends.add('Talent Strategy Evolution');

    return Array.from(trends).slice(0, 3);
}
