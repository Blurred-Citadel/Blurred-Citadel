import React, { useState } from 'react';
import { KnowledgeProcessor } from './knowledgeProcessing';

interface AddToKnowledgeBaseProps {
  newsItem: {
    description: string;
    url: string;
  };
  onAdd: (processedItem: any) => void;
}

const AddToKnowledgeBase: React.FC<AddToKnowledgeBaseProps> = ({ newsItem, onAdd }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    setIsProcessing(true);
    setError('');
    
    try {
      const processor = new KnowledgeProcessor();
      const processedItem = await processor.processDocument(
        newsItem.description,
        'news',
        newsItem.url
      );
      onAdd(processedItem);
    } catch (err) {
      setError('Failed to process article');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleAdd}
      disabled={isProcessing}
      className={`inline-flex items-center px-3 py-1 rounded-md text-sm
        ${isProcessing 
          ? 'bg-gray-200 text-gray-500' 
          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`
      }
    >
      {isProcessing ? (
        <>
          <span className="mr-2">Processing...</span>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </>
      ) : (
        <>
          <span className="mr-2">Add to Knowledge Base</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </>
      )}
    </button>
  );
};

export default AddToKnowledgeBase;
