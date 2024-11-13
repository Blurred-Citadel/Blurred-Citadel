import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

type AnalysisResult = {
  title: string;
  content: string;
  category: string;
  tags: string[];
  keyStats: string[];
  thoughtLeadership: string[];
  connections: {
    documentId: string;
    strength: number;
  }[];
}

type ExistingDocument = {
  id: string;
  title: string;
  content: string;
  category: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileContent, existingDocuments }: { 
      fileContent: string, 
      existingDocuments: ExistingDocument[] 
    } = req.body;

    // Analyze the PDF content using GPT-4
    const analysisPrompt = `
    Analyze this document and provide a structured analysis. Include:
    1. A title that captures the main topic
    2. A brief executive summary (2-3 sentences)
    3. The primary category it belongs to
    4. Relevant tags (5-7 keywords)
    5. The 5 most notable statistics from the report
    6. 3 key thought leadership points
    
    Format the response as JSON:
    {
      "title": "string",
      "content": "string",
      "category": "string",
      "tags": ["string"],
      "keyStats": ["string"],
      "thoughtLeadership": ["string"]
    }`;

    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert analyst specializing in workforce solutions and recruitment industry trends."
        },
        {
          role: "user",
          content: analysisPrompt + "\n\nDocument content:\n" + fileContent
        }
      ],
      temperature: 0.7,
    });

    const analysis = JSON.parse(analysisResponse.choices[0].message.content || '{}');

    // If there are existing documents, analyze connections
    let connections: { documentId: string; strength: number; }[] = [];
    
    if (existingDocuments && existingDocuments.length > 0) {
      const connectionsPrompt = `
      Compare this document with each of the following documents and rate their connection strength from 0-100 based on:
      - Shared topics and themes
      - Related statistics or findings
      - Complementary insights
      
      New document summary: ${analysis.content}
      
      Format the response as JSON array: [{"documentId": "string", "strength": number}]
      
      Existing documents:
      ${existingDocuments.map((doc: ExistingDocument) => 
        `ID: ${doc.id}\nTitle: ${doc.title}\nContent: ${doc.content}`
      ).join('\n\n')}`;

      const connectionsResponse = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing document relationships and connections."
          },
          {
            role: "user",
            content: connectionsPrompt
          }
        ],
        temperature: 0.7,
      });

      connections = JSON.parse(connectionsResponse.choices[0].message.content || '[]');
    }

    const result: AnalysisResult = {
      ...analysis,
      connections
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('PDF Analysis Error:', error);
    res.status(500).json({
      error: 'Failed to analyze PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
