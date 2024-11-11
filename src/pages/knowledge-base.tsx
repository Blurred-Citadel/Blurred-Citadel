import React, { useState } from 'react';
import Link from 'next/link';
import { KnowledgeItem } from '@/components/knowledge/types';
import DocumentUpload from '@/components/knowledge/DocumentUpload';

// Sample data - later we'll move this to a database
const sampleKnowledge: KnowledgeItem[] = [
  {
    id: '1',
    title: 'AI Impact on Technical Recruitment',
    content: 'Analysis of how AI is transforming technical recruitment processes and changing the way organizations identify and assess talent. Key areas include automated screening, predictive analytics for candidate success, and AI-driven interview processes.',
    summary: 'Overview of AI\'s impact on technical recruitment processes.',
    source: {
      type: 'news',
      url: 'https://example.com/article1',
    },
    category: 'Technology',
    tags: ['AI', 'recruitment', 'automation'],
    connections: ['2', '4'],
    aiAnalysis: {
      keyTopics: ['AI recruitment', 'automation', 'candidate screening'],
      sentiment: 'positive',
      relevanceScore: 0.85,
      suggestedConnections: ['2', '4']
    },
    dateAdded: '2024-03-20',
    lastUpdated: '2024-03-20'
  },
  {
    id: '2',
    title: 'Remote Work Trends 2024',
    content: 'Comprehensive analysis of remote work adoption trends and their impact on workforce management. Includes data on productivity metrics, collaboration tools, and emerging challenges in virtual team management.',
    summary: 'Analysis of remote work trends and their workforce impact.',
    source: {
      type: 'pdf',
      url: 'https://example.com/report1',
    },
    category: 'Workforce Trends',
    tags: ['remote work', 'workforce', 'trends'],
    connections: ['1', '3'],
    aiAnalysis: {
      keyTopics: ['remote work', 'productivity', 'virtual teams'],
      sentiment: 'neutral',
      relevanceScore: 0.78,
      suggestedConnections: ['1', '3']
    },
    dateAdded: '2024-03-19',
    lastUpdated: '2024-03-19'
  },
  {
    id: '3',
    title: 'MSP Market Evolution',
    content: 'Deep dive into the changing landscape of Managed Service Provider models. Explores new service delivery approaches, technology integration, and evolving client expectations in the MSP space.',
    summary: 'Analysis of MSP market changes and service delivery evolution.',
    source: {
      type: 'web',
      url: 'https://example.com/article3',
    },
    category: 'MSP',
    tags: ['MSP', 'service delivery', 'market trends'],
    connections: ['2'],
    aiAnalysis: {
      keyTopics: ['MSP evolution', 'service delivery', 'client expectations'],
      sentiment: 'positive',
      relevanceScore: 0.92,
      suggestedConnections: ['2']
    },
    dateAdded: '2024-03-18',
    lastUpdated: '2024-03-18'
  },
  {
    id: '4',
    title: 'Skills Gap Analysis 2024',
    content: 'Detailed analysis of current skills gaps in the technology sector, including emerging technical requirements, training needs, and strategies for addressing skill shortages in the modern workforce.',
    summary: 'Analysis of technology sector skills gaps and solutions.',
    source: {
      type: 'news',
      url: 'https://example.com/article4',
    },
    category: 'Skills',
    tags: ['skills', 'technology', 'training'],
    connections: ['1'],
    aiAnalysis: {
      keyTopics: ['skills gap', 'technical skills', 'workforce training'],
      sentiment: 'neutral',
      relevanceScore: 0.88,
      suggestedConnections: ['1']
    },
    dateAdded: '2024-03-17',
    lastUpdated: '2024-03-17'
  }
];

export default function KnowledgeBase() {
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUpload, setShowUpload] = useState(false);

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

  const handleUpload = async (processedItem: Partial<KnowledgeItem>) => {
    console.log('Processed upload:', processedItem);
    // TODO: Add to database
    setShowUpload(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-black text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold py-4">Blurred Citadel</h1>
        </div>
      </header>

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

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search knowledge base..."
                className="w-full p-2 border rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
            <button
              onClick={() => setShowUpload(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Document
            </button>
          </div>
        </div>

        {showUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Upload Document</h2>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <DocumentUpload onUpload={handleUpload} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Added: {new Date(item.dateAdded).toLocaleDateString()}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${item.aiAnalysis.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                      item.aiAnalysis.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                    {item.aiAnalysis.sentiment}
                  </span>
                </div>
              </div>
            ))}
          </div>

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
                  {selectedItem.source.url && (
                    <a
                      href={selectedItem.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Source
                    </a>
                  )}
                </div>

                <div className="prose max-w-none mb-6">
                  <h3 className="text-lg font-semibold mb-2">Summary</h3>
                  <p>{selectedItem.summary}</p>
                  <h3 className="text-lg font-semibold mt-4 mb-2">Full Content</h3>
                  <p>{selectedItem.content}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">AI Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Key Topics</h4>
                      <ul className="space-y-1">
                        {selectedItem.aiAnalysis.keyTopics.map((topic, index) => (
                          <li key={index} className="text-gray-600">{topic}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Relevance Score</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${selectedItem.aiAnalysis.relevanceScore * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round(selectedItem.aiAnalysis.relevanceScore * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

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
