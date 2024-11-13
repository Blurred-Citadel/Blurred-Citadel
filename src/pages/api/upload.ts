import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { IncomingForm } from 'formidable';
import fs from 'fs/promises';
import pdf from 'pdf-parse';

// Tell Next.js not to parse the body as JSON
export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function analyzePDFContent(content: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert analyst specializing in workforce solutions and recruitment industry trends. Analyze the provided document and create a structured summary."
        },
        {
          role: "user",
          content: `Please analyze this document and provide a structured analysis in the following format:
          {
            "title": "Brief descriptive title",
            "description": "2-3 sentence summary",
            "category": "Technology/Healthcare/Finance/Manufacturing/Professional Services/Engineering/Cross-Industry",
            "tags": ["relevant", "topic", "tags"],
            "analysis": {
              "keyInsights": ["insight 1", "insight 2", "insight 3"],
              "implications": {
                "shortTerm": "Short term implications",
                "longTerm": "Long term implications"
              },
              "relevanceScore": 1-10,
              "workforceTrends": ["trend 1", "trend 2"]
            }
          }

          Document content:
          ${content}`
        }
      ],
      temperature: 0.7,
    });

    // Parse the response into structured data
    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    return analysis;
  } catch (error) {
    console.error('Error analyzing content:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    // Parse the form
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const uploadedFile = Array.isArray(files.document) ? files.document[0] : files.document;
    
    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read the PDF file
    const fileBuffer = await fs.readFile(uploadedFile.filepath);
    const pdfData = await pdf(fileBuffer);
    
    // Analyze the content
    const analysis = await analyzePDFContent(pdfData.text);

    // Add metadata
    const knowledgeItem = {
      ...analysis,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      connections: [], // We'll populate this later
      sourceFile: uploadedFile.originalFilename,
    };

    // Here we'd normally save to a database
    // For now, we'll just return the analysis
    
    res.status(200).json({
      message: 'File processed successfully',
      analysis: knowledgeItem
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Error processing file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
