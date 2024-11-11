import React, { useState } from 'react';
import { KnowledgeProcessor } from './knowledgeProcessing';

interface DocumentUploadProps {
  onUpload: (processedItem: any) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setIsProcessing(true);
    setError('');

    const files = 'dataTransfer' in e 
      ? e.dataTransfer?.files 
      : (e.target as HTMLInputElement).files;
      
    if (!files?.length) return;

    try {
      const file = files[0];
      const text = await file.text();
      
      const processor = new KnowledgeProcessor();
      const processedItem = await processor.processDocument(
        text,
        'pdf',
        null
      );
      onUpload(processedItem);
    } catch (err) {
      setError('Failed to process document');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleFileDrop}
      className={`p-8 border-2 border-dashed rounded-lg text-center
        ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
        ${isProcessing ? 'opacity-50' : ''}`}
    >
      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileDrop}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="space-y-2">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="text-sm text-gray-600">
            {isProcessing ? (
              "Processing document..."
            ) : (
              <>
                <span className="text-blue-600">Upload a file</span> or drag and drop
              </>
            )}
          </div>
          <div className="text-xs text-gray-500">
            PDF, DOC, DOCX, TXT up to 10MB
          </div>
        </div>
      </label>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  );
};

export default DocumentUpload;
