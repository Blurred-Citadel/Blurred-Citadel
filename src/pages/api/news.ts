import type { NextApiRequest, NextApiResponse } from 'next';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Return sample data since we don't have API keys configured
    const sampleNews: ProcessedArticle[] = [
      {
        title: "AI Revolutionizes Recruitment Processes",
        description: "Major companies are implementing AI-powered recruitment tools, leading to significant improvements in hiring efficiency and candidate matching. Early adopters report reduced time-to-hire and better quality candidates.",
        url: "https://example.com/ai-recruitment",
        source: "Tech News Daily",
        publishedAt: new Date().toISOString(),
        impact: "High",
        sector: "Technology",
        analysis: {
          keyInsights: [
            "AI reducing time-to-hire by 50%",
            "Improved candidate matching accuracy",
            "Reduced bias in initial screening"
          ],
          implications: {
            shortTerm: "Companies adopting AI tools seeing immediate efficiency gains in recruitment",
            longTerm: "Fundamental transformation of hiring practices and recruiter roles"
          },
          relevanceScore: 9,
          workforceTrends: ["AI Adoption", "Digital Transformation", "Automated Screening"]
        }
      },
      {
        title: "Remote Work Trends Shape 2024 Workforce",
        description: "New data shows permanent shift in work arrangements as companies finalize hybrid policies. Employee preferences and productivity metrics drive decision-making.",
        url: "https://example.com/remote-work-2024",
        source: "Workforce Weekly",
        publishedAt: new Date().toISOString(),
        impact: "Medium",
        sector: "Cross-Industry",
        analysis: {
          keyInsights: [
            "70% of companies now offer hybrid options",
            "Productivity remains high in remote settings",
            "Investment in digital collaboration tools increasing"
          ],
          implications: {
            shortTerm: "Continued investment in remote work infrastructure",
            longTerm: "Evolution of company culture and management practices"
          },
          relevanceScore: 8,
          workforceTrends: ["Remote Work", "Digital Collaboration", "Flexible Schedules"]
        }
      },
      {
        title: "Skills Gap Widens in Technology Sector",
        description: "Growing demand for specialized tech skills creates challenges for employers. Training programs and educational partnerships emerge as key solutions.",
        url: "https://example.com/tech-skills-gap",
        source: "Industry Insights",
        publishedAt: new Date().toISOString(),
        impact: "High",
        sector: "Technology",
        analysis: {
          keyInsights: [
            "Demand for AI/ML skills up 120% YoY",
            "Companies increasing training budgets",
            "Universities adapting curricula"
          ],
          implications: {
            shortTerm: "Increased competition for skilled workers",
            longTerm: "Transformation of technical education and training"
          },
          relevanceScore: 9,
          workforceTrends: ["Upskilling", "Technical Education", "Talent Competition"]
        }
      },
      {
        title: "MSP Industry Adapts to New Market Demands",
        description: "Managed Service Providers evolve service offerings to meet changing client needs. Technology integration and flexibility drive innovations.",
        url: "https://example.com/msp-evolution",
        source: "Business Technology Review",
        publishedAt: new Date().toISOString(),
        impact: "Medium",
        sector: "Professional Services",
        analysis: {
          keyInsights: [
            "Service customization increasing",
            "Technology stack modernization",
            "Focus on scalability"
          ],
          implications: {
            shortTerm: "Service offering updates and technology investments",
            longTerm: "Industry consolidation and specialization"
          },
          relevanceScore: 7,
          workforceTrends: ["Service Innovation", "Technical Integration", "Specialization"]
        }
      }
    ];

    // Filter based on category if provided
    const category = Array.isArray(req.query.category) 
      ? req.query.category[0] 
      : req.query.category || 'all';

    const region = Array.isArray(req.query.region)
      ? req.query.region[0]
      : req.query.region || 'global';

    let filteredNews = sampleNews;

    // Apply category filter
    if (category !== 'all') {
      filteredNews = filteredNews.filter(article => {
        switch(category) {
          case 'ai':
            return article.sector === 'Technology' && article.analysis.workforceTrends.some(trend => 
              trend.toLowerCase().includes('ai') || trend.toLowerCase().includes('automation'));
          case 'labor':
            return article.analysis.workforceTrends.some(trend => 
              trend.toLowerCase().includes('work') || trend.toLowerCase().includes('talent'));
          case 'msp':
            return article.sector === 'Professional Services';
          case 'stem':
            return article.sector === 'Technology' || article.sector === 'Engineering';
          default:
            return true;
        }
      });
    }

    // Apply region filter if needed
    if (region !== 'global') {
      // In the sample data we don't have region info
      // In a real app, you'd filter by region here
    }

    res.status(200).json(filteredNews);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch news',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
