import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { IncomingForm, Fields, Files } from 'formidable';
import fs from 'fs/promises';
import pdf from 'pdf-parse';

// Tell Next.js not to parse the body as JSON
export const config = {
  api: {
    bodyParser: false,
  },
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

type ProcessedData = {
  title: string;
  content: string;
  tags: string[];
  category: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm({
      keepExtensions: true,
      multiples: false,
    });

    // Type-safe promise wrapper for form.parse
    const formData = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const { files } = formData;
    const fileKey = Object.keys(files)[0];
    const file = Array.isArray(files[fileKey]) ? files[fileKey][0] : files[fileKey];

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read the file content
    const fileContent = await fs.readFile(file.filepath);
    const data = await pdf(fileContent);

    // Extract text content
    const textContent = data.text;

    // Process with GPT-4
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing documents and extracting key information. Format your response as JSON with the following structure: {title: string, content: string, tags: string[], category: string}"
        },
        {
          role: "user",
          content: `Analyze this document and provide a summary with key details: ${textContent}`
        }
      ],
      temperature: 0.7,
    });

    if (!completion.choices[0].message.content) {
      throw new Error('No response from OpenAI');
    }

    const processedData = JSON.parse(completion.choices[0].message.content) as ProcessedData;

    // Clean up: Delete the temporary file
    await fs.unlink(file.filepath);

    res.status(200).json(processedData);
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ 
      error: 'Failed to process file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
