import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchKnowledgeItems, createKnowledgeItem, detectConnections, type KnowledgeItem } from '../lib/supabase';

export default function KnowledgeBase() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    content: '',
    category: '',
    tags: ['']
  });

  // Fetch items on component mount
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await fetchKnowledgeItems();
      setItems(data);
    } catch (err) {
      setError('Failed to load knowledge base items');
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(items.map(item => item.category)))];

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getConnectedItems = (itemId: string) => {
    return items.filter(item => 
      selectedItem?.connections?.includes(item.id)
    );
  };

  const handleCreateItem = async () => {
    try {
      if (!newItem.title || !newItem.content || !newItem.category) {
        setError('Please fill in all required fields');
        return;
      }

      const createdItem = await createKnowledgeItem(newItem);
      if (createdItem) {
        await detectConnections(createdItem.id);
        await loadItems();
        setIsCreating(false);
        setNewItem({ title: '', content: '', category: '', tags: [''] });
      }
    } catch (err) {
      setError('Failed to create new item');
      console.error('Error creating item:', err);
    }
  };

  const handleAddTag = () => {
    setNewItem(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const handleRemoveTag = (index: number) => {
    setNewItem(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleTagChange = (index: number, value: string) => {
    setNewItem(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }));
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
        {/* Search and Filter */}
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
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              New Entry
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded mb-4">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Create New Item Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
              <h2 className="text-xl font-bold mb-4">Create New Knowledge Base Entry</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    value={newItem.content}
                    onChange={(e) => setNewItem(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full p-2 border rounded h-32"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newItem.category}
                    onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  {newItem.tags.map((tag, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => handleTagChange(index, e.target.value)}
                        className="flex-1 p-2 border rounded"
                      />
                      <button
                        onClick={() => handleRemoveTag(index)}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddTag}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Tag
                  </button>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateItem}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Create Entry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Grid */}
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
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
                    {item.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Added: {new Date(item.date_added).toLocaleDateString()}
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
                      Last updated: {new Date(selectedItem.last_updated).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="prose max-w-none mb-6">
                    <p>{selectedItem.content}</p>
                  </div>

                  {/* Tags */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.tags?.map((tag, index) => (
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
        )}
      </div>
    </div>
  );
}
