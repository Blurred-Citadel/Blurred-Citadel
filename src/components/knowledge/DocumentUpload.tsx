import React, { useState } from 'react';

interface ProcessedItem {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

interface DocumentUploadProps {
  onUpload: (item: ProcessedItem) => void;
}

export default function DocumentUpload({ onUpload }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processDocument = async (file: File): Promise<ProcessedItem> => {
    // Basic document processing
    const text = await file.text();
    return {
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
      content: text,
      category: 'Uncategorized',
      tags: []
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);
      
      const file = event.target.files?.[0];
      if (!file) {
        throw new Error('No file selected');
      }

      // Check file type
      if (!file.type.match('text/*') && file.type !== 'application/pdf') {
        throw new Error('Only text and PDF files are supported');
      }

      const processedItem = await processDocument(file);
      onUpload(processedItem);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Document
        </label>
        <input
          type="file"
          accept=".txt,.pdf"
          onChange={handleFileUpload}
          disabled={uploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>
      
      {uploading && (
        <div className="text-sm text-gray-600">Processing document...</div>
      )}
      
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      
      <div className="mt-2 text-xs text-gray-500">
        Supported formats: .txt, .pdf
      </div>
    </div>
  );
}
