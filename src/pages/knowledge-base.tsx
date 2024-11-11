import React, { useState } from 'react';
import Link from 'next/link';

type KnowledgeItem = {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  connections: string[];
  dateAdded: string;
  lastUpdated: string;
}

// Sample data - later we'll move this to a database
const sampleKnowledge: KnowledgeItem[] = [
  {
    id: '1',
    title: 'AI Impact on Technical Recruitment',
    content: 'Analysis of how AI is transforming technical recruitment processes and changing the way organizations identify and assess talent. Key areas include automated screening, predictive analytics for candidate success, and AI-driven interview processes.',
    category: 'Technology',
    tags: ['AI', 'recruitment', 'automation'],
    connections: ['2', '4'],
    dateAdded: '2024-03-20',
    lastUpdated: '2024-03-20'
  },
  {
    id: '2',
    title: 'Remote Work Trends 2024',
    content: 'Comprehensive analysis of remote work adoption trends and their impact on workforce management. Includes data on productivity metrics, collaboration tools, and emerging challenges in virtual team management.',
    category: 'Workforce Trends',
    tags: ['remote work', 'workforce', 'trends'],
    connections: ['1', '3'],
    dateAdded: '2024-03-19',
    lastUpdated: '2024-03-19'
  },
  {
    id: '3',
    title: 'MSP Market Evolution',
    content: 'Deep dive into the changing landscape of Managed Service Provider models. Explores new service delivery approaches, technology integration, and evolving client expectations in the MSP space.',
    category: 'MSP',
    tags: ['MSP', 'service delivery', 'market trends'],
    connections: ['2'],
    dateAdded: '2024-03-18',
    lastUpdated: '2024-03-18'
  },
  {
    id: '4',
    title: 'Skills Gap Analysis 2024',
    content: 'Detailed analysis of current skills gaps in the technology sector, including emerging technical requirements, training needs, and strategies for addressing skill shortages in the modern workforce.',
    category: 'Skills',
    tags: ['skills', 'technology', 'training'],
    connections: ['1'],
    dateAdded: '2024-03-17',
    lastUpdated: '2024-03-17'
  }
];

export default function KnowledgeBase() {
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const categories = ['all', ...Array.from(new Set(sampleKnowledge.map(item => item.category)))];

  const filteredItems = sampleKnowledge.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getConnectedItems = (itemId: string) => {
    return sampleKnowledge.filter(item =>
      selectedItem?.connections.includes(item.id)
    );
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('documents', files[i]);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadSuccess(true);
      // You could refresh the knowledge base items here if needed
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload documents');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-black text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold py-4">Blurred Citadel</h1>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex space-x-4 py-3">
            <Link href="/" className="text-gray-300 hover:text-white">News</Link>
            <Link href="/knowledge-base" className="text-white">Knowledge Base</Link>
            <Link href="#" className="text-gray-300 hover:text-white">Reports</Link>
            <Link href="#" className="text-gray-300 hover:text-white">Analytics</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search, Filter, and Upload */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search knowledge base..."
              className="flex-1 p-2 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="p-2 border rounded"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Upload Section */}
          <div className="border rounded p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
            <div className="space-y-2">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {isUploading && (
                <div className="text-blue-600">Uploading documents...</div>
              )}
              {uploadError && (
                <div className="text-red-600">{uploadError}</div>
              )}
              {uploadSuccess && (
                <div className="text-green-600">Documents uploaded successfully!</div>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Knowledge Items List */}
          <div className="lg:col-span-1 space-y-4">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors duration-200 ${
                  selectedItem?.id === item.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white hover:bg-gray-50 border-gray-200'
                }`}
                onClick={() => setSelectedItem(item)}
              >
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Added: {new Date(item.dateAdded).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>

          {/* Selected Item Detail */}
          <div className="lg:col-span-2">
            {selectedItem ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-4">{selectedItem.title}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {selectedItem.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    Last updated: {new Date(selectedItem.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
                <div className="prose max-w-none mb-6">
                  <p>{selectedItem.content}</p>
                </div>
                {/* Tags */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Connected Items */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Connected Items</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getConnectedItems(selectedItem.id).map(item => (
                      <div
                        key={item.id}
                        className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => setSelectedItem(item)}
                      >
                        <h4 className="font-medium mb-2">{item.title}</h4>
                        <div className="text-sm text-gray-500">{item.category}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center text-gray-500">
                Select an item to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
