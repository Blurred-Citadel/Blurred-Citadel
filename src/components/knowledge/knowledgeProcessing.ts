import OpenAI from 'openai';
import { KnowledgeItem } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class KnowledgeProcessor {
  async processDocument(
    content: string,
    sourceType: 'news' | 'pdf' | 'web',
    sourceUrl?: string
  ): Promise<Partial<KnowledgeItem>> {
    // Generate AI analysis
    const analysisPrompt = `
      Analyze the following content and provide:
      1. A concise summary (max 200 words)
      2. Key topics (max 5)
      3. Overall sentiment
      4. Suggested tags
      5. Main category
      
      Content: ${content}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert analyst specializing in workforce solutions and recruitment industry trends."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    return {
      title: analysis.title || 'Untitled Document',
      content: content,
      summary: analysis.summary,
      source: {
        type: sourceType,
        url: sourceUrl,
        originalContent: content
      },
      category: analysis.category,
      tags: analysis.tags,
      aiAnalysis: {
        keyTopics: analysis.keyTopics,
        sentiment: analysis.sentiment,
        relevanceScore: 0,
        suggestedConnections: []
      },
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
  }

  async findConnections(item: KnowledgeItem, existingItems: KnowledgeItem[]): Promise<string[]> {
    const connectionsPrompt = `
      Given this new item:
      Title: ${item.title}
      Summary: ${item.summary}
      Topics: ${item.aiAnalysis.keyTopics.join(', ')}
      
      Find the most relevant connections from these existing items:
      ${existingItems.map(existing => `
        ID: ${existing.id}
        Title: ${existing.title}
        Topics: ${existing.aiAnalysis.keyTopics.join(', ')}
      `).join('\n')}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Find meaningful connections between knowledge items based on shared topics, themes, and relevance."
        },
        {
          role: "user",
          content: connectionsPrompt
        }
      ],
    });

    return JSON.parse(completion.choices[0].message.content || '[]');
  }
}
