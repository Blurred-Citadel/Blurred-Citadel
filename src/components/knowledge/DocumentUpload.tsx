import React, { useState, ChangeEvent } from 'react';
import { AlertCircle, Upload, CheckCircle2, XCircle } from 'lucide-react';

const DocumentUpload = () => {
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploadStatus('uploading');
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      setUploadStatus('success');
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to upload file. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="mb-6">
        <label 
          htmlFor="file-upload"
          className={`
            relative flex flex-col items-center justify-center w-full h-64 
            border-2 border-dashed rounded-lg cursor-pointer 
            ${uploadStatus === 'error' ? 'border-red-300 bg-red-50' : 
              uploadStatus === 'success' ? 'border-green-300 bg-green-50' : 
              'border-gray-300 bg-gray-50'} 
            hover:bg-gray-100 transition-colors
          `}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploadStatus === 'idle' && (
              <>
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX, TXT (MAX. 10MB)
                </p>
              </>
            )}
            
            {uploadStatus === 'uploading' && (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-3" />
                <p className="text-sm text-gray-500">Uploading {fileName}...</p>
              </div>
            )}

            {uploadStatus === 'success' && (
              <>
                <CheckCircle2 className="w-10 h-10 mb-3 text-green-500" />
                <p className="text-sm text-green-600">File uploaded successfully!</p>
                <p className="text-xs text-green-500">{fileName}</p>
              </>
            )}

            {uploadStatus === 'error' && (
              <>
                <XCircle className="w-10 h-10 mb-3 text-red-500" />
                <p className="text-sm text-red-600">Upload failed</p>
                <p className="text-xs text-red-500">{fileName}</p>
              </>
            )}
          </div>
          <input 
            id="file-upload" 
            type="file" 
            className="hidden" 
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt"
          />
        </label>
      </div>

      {uploadStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Upload Failed! </strong>
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
