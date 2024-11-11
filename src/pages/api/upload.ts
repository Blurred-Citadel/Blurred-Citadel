import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'public', 'uploads'),
      keepExtensions: true,
      maxFiles: 5,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const [fields, files] = await form.parse(req);

    // Process the uploaded files
    const uploadedFiles = Array.isArray(files.documents) 
      ? files.documents 
      : [files.documents];

    const fileDetails = uploadedFiles.map(file => ({
      name: file.originalFilename,
      size: file.size,
      path: file.filepath,
    }));

    res.status(200).json({ 
      message: 'Files uploaded successfully',
      files: fileDetails 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Error uploading files',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
