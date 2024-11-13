import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { supabase } from '@/lib/supabase';

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
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowEmptyFiles: false,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ message: 'Error processing upload' });
      }

      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      
      if (!file) {
        return res.status(400).json({ message: 'No file provided' });
      }

      try {
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('knowledge-base')
          .upload(`documents/${Date.now()}-${file.originalFilename}`, file);

        if (error) {
          throw error;
        }

        res.status(200).json({ 
          message: 'File uploaded successfully',
          filename: file.originalFilename,
          path: data.path
        });
      } catch (uploadError) {
        console.error('Supabase upload error:', uploadError);
        res.status(500).json({ message: 'Error uploading to storage' });
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
}
