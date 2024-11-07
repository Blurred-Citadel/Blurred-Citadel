import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const NEWS_API_KEY = process.env.NEWS_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

// Enhanced workforce-related keywords
const keywordGroups = [
  // Workforce Trends
  'workforce trends',
  'labor shortage',
  'skills gap',
  'talent acquisition',
  'great resignation',
  'quiet quitting',
  'workforce development',
  
  // Recruitment & Staffing
  'recruitment industry',
  'staffing sector',
  'talent solutions',
  'contingent workforce',
  'contractor management',
  
  // Work Models
  'remote work',
  'hybrid workplace',
  'flexible working',
  'distributed teams',
  
  // Industry Specific
  'IT staffing',
  'tech recruitment',
  'healthcare staffing',
  'engineering recruitment',
  'professional services',
  
  // Business Impact
  'labor costs',
  'workforce management',
  'employee retention',
  'staff turnover',
  'talent strategy'
].join(' OR ');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Fetch news with enhanced parameters
    const response = await fetch(
      `https://newsapi.org/v2/everything?` +
      `q=${encodeURIComponent(keywordGroups)}&` +
      `language=en&` +
      `sortBy=relevancy&` +
      `pageSize=20&` + // Increased to get more candidates for filtering
      `excludeDomains=youtube.com,instagram.com&` + // Exclude social media
      `apiKey=${NEWS_API_KEY}`
    )

    const data = await response.json()
    
    // Pre-filter articles for relevance
    const preFilteredArticles = data.articles.filter((article: any) => {
      const combinedText = `${article.title} ${article.description}`.toLowerCase();
      
      // Must contain at least one workforce-related term
      const hasWorkforceTerms = /workforce|recruitment|staffing|talent|labor|employment/.test(combinedText);
      
      // Exclude certain types of articles
      const isJobPosting = /job posting|position available|we're hiring|apply now/.test(combinedText);
      const isPromotion = /sponsored|advertisement|promoted/.test(combinedText);
      
      return hasWorkforceTerms && !isJobPosting && !isPromotion;
    });

    // Process the filtered articles
    const analysisPromises = preFilteredArticles.slice(0, 12).map(async (article: any) => {
      const content = `
Title: ${article.title}
Description: ${article.description}
Source: ${article.source.name}
      `;

      try {
        const analysis = await analyzeWithAI(content);
        
        // Only include articles with high enough relevance
        if (analysis.relevanceScore >= 6) {
          return {
            title: article.title,
            description: article.description,
            url: article.url,
            source: article.source.name,
            publishedAt: article.publishedAt,
            impact: analysis.impact,
            sector: analysis.sector,
            analysis: {
              keyInsights: analysis.keyInsights,
              implications: analysis.implications,
              relevanceScore: analysis.relevanceScore,
              workforceTrends: analysis.workforceTrends
            }
          };
        }
        return null;
      } catch (error) {
        console.error('Error analyzing article:', error);
        return null;
      }
    });

    const analyzedArticles = (await Promise.all(analysisPromises))
      .filter(article => article !== null)
      .sort((a: any, b: any) => b.analysis.relevanceScore - a.analysis.relevanceScore);

    res.status(200).json(analyzedArticles);

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to process news' });
  }
}

async function analyzeWithAI(content: string) {
  try {
    const prompt = `
Analyze this workforce-related news article with a focus on staffing industry and recruitment implications:

${content}

Provide analysis in the following JSON format:
{
  "impact": "High/Medium/Low", // Based on significance to staffing/recruitment industry
  "sector": string, // Choose from: ["IT/Technology", "Healthcare", "Professional Services", "Industrial/Manufacturing", "Finance/Banking", "Engineering", "Cross-Industry"]
  "keyInsights": string[], // 2-3 most important takeaways for staffing industry
  "implications": {
    "shortTerm": string, // Immediate impact on staffing/recruitment
    "longTerm": string // Long-term industry implications
  },
  "relevanceScore": number, // 1-10 rating for relevance to staffing industry
  "workforceTrends": string[] // 2-3 relevant workforce trends identified
}

Focus specifically on:
- Impact on staffing and recruitment industry
- Changes in workforce demands
- Skills and talent implications
- Market opportunities for staffing providers
- Client industry developments
`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert analyst specializing in workforce solutions, staffing industry, and recruitment markets. Focus on practical insights for staffing industry professionals."
        },
        { role: "user", content: prompt }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.3,
    });

    const analysisText = completion.choices[0].message.content || '{}';
    return JSON.parse(analysisText);

  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw error;
  }
}
