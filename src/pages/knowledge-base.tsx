import React, { useState, useRef } from 'react';
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
  files?: {
    name: string;
    url: string;
    type: string;
  }[];
};

// Sample data
const sampleKnowledge: KnowledgeItem[] = [
  {
    id: '1',
    title: 'AI Impact on Technical Recruitment',
    content: 'Analysis of how AI is transforming technical recruitment processes and changing the way organizations identify and assess talent. Key areas include automated screening, predictive analytics for candidate success, and AI-driven interview processes.',
    category: 'Technology',
    tags: ['AI', 'recruitment', 'automation'],
    connections: ['2', '4'],
    dateAdded: '2024-03-20',
    lastUpdated: '2024-03-20',
    files: [
      {
        name: 'AI_Recruitment_Study.pdf',
        url: '#',
        type: 'pdf'
      }
    ]
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
  }
];

export default function KnowledgeBase() {
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>(sampleKnowledge);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [newItem, setNewItem] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    files: [] as File[]
  });

  const categories = ['all', ...Array.from(new Set(knowledge.map(item => item.category)))];

  const filteredItems = knowledge.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewItem(prev => ({
        ...prev,
        files: [...prev.files, ...filesArray]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new knowledge item
    const newKnowledgeItem: KnowledgeItem = {
      id: (knowledge.length + 1).toString(),
      title: newItem.title,
      content: newItem.content,
      category: newItem.category,
      tags: newItem.tags.split(',').map(tag => tag.trim()),
      connections: [],
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      files: newItem.files.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type
      }))
    };

    // Add to knowledge base
    setKnowledge(prev => [...prev, newKnowledgeItem]);
    
    // Reset form
    setNewItem({
      title: '',
      content: '',
      category: '',
      tags: '',
      files: []
    });
    
    setShowAddForm(false);
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
        {/* Controls */}
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
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setShowAddForm(true)}
            >
              Add New
            </button>
          </div>
        </div>

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <h2 className="text-xl font-bold mb-4">Add New Knowledge Item</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border rounded-md p-2"
                    value={newItem.title}
                    onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    className="mt-1 block w-full border rounded-md p-2"
                    rows={4}
                    value={newItem.content}
                    onChange={(e) => setNewItem(prev => ({ ...prev, content: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border rounded-md p-2"
                    value={newItem.category}
                    onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border rounded-md p-2"
                    value={newItem.tags}
                    onChange={(e) => setNewItem(prev => ({ ...prev, tags: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Files</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    accept=".pdf,.doc,.docx"
                    className="mt-1 block w-full"
                  />
                  {newItem.files.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-700">Selected files:</h4>
                      <ul className="list-disc pl-5">
                        {newItem.files.map((file, index) => (
                          <li key={index} className="text-sm text-gray-600">{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                {/* Attached Files */}
                {selectedItem.files && selectedItem.files.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Attached Files</h3>
                    <div className="space-y-2">
                      {selectedItem.files.map((file, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {file.name}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
