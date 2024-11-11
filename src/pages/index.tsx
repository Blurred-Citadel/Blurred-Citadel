import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type NewsItem = {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  impact: string;
  sector: string;
  analysis?: {
    keyInsights: string[];
    implications: {
      shortTerm: string;
      longTerm: string;
    };
    relevanceScore: number;
    workforceTrends: string[];
  };
}

const CATEGORIES = [
  { id: 'ai', name: 'AI & Automation' },
  { id: 'labor', name: 'Labour Market' },
  { id: 'msp', name: 'MSP/RPO' },
  { id: 'stem', name: 'STEM' },
  { id: 'chomsky', name: 'Critical Analysis' },
  { id: 'all', name: 'All Categories' }
];

const REGIONS = [
  { id: 'uk', name: 'United Kingdom' },
  { id: 'usa', name: 'United States' },
  { id: 'eu', name: 'Europe' },
  { id: 'global', name: 'Global' }
];

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('global');

  useEffect(() => {
    fetchNews();
  }, [selectedCategory, selectedRegion]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/news?category=${selectedCategory}&region=${selectedRegion}`);
      const data = await response.json();
      setNews(data);
    } catch (err) {
      setError('Failed to fetch news');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCard = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  const FilterButton = ({
    active,
    onClick,
    children
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
        ${active
          ? 'bg-gray-900 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
    >
      {children}
    </button>
  );

  const MainContent = () => (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-2">Category Focus</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(category => (
              <FilterButton
                key={category.id}
                active={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </FilterButton>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-2">Geographic Region</h2>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map(region => (
              <FilterButton
                key={region.id}
                active={selectedRegion === region.id}
                onClick={() => setSelectedRegion(region.id)}
              >
                {region.name}
              </FilterButton>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <div className="text-sm text-gray-500">
            Showing: {' '}
            <span className="font-medium text-gray-900">
              {CATEGORIES.find(c => c.id === selectedCategory)?.name} •
              {REGIONS.find(r => r.id === selectedRegion)?.name}
            </span>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedRegion('global');
                }}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {news.map((item, index) => (
          <div key={index}>
            <div
              className="bg-gray-50 shadow rounded-lg transition-all duration-300 h-[400px] cursor-pointer hover:shadow-lg border border-gray-200"
              onClick={() => toggleCard(index)}
            >
              <div className="p-4 h-full flex flex-col">
                <div className="flex-none">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h2>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 mb-2"
                  >
                    Read original article
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${item.impact.toLowerCase() === 'high' ? 'bg-red-100 text-red-800' :
                        item.impact.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'}`}
                    >
                      {item.impact}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                      {item.sector}
                    </span>
                  </div>
                </div>

                <div className="flex-grow overflow-hidden">
                  <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>
                  {item.analysis && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Click to view full analysis</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                  {item.source} • {new Date(item.publishedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {expandedCard === index && (
              <>
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 z-40"
                  onClick={() => toggleCard(index)}
                />
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                  bg-gray-50 rounded-lg shadow-xl z-50 w-[90%] max-w-6xl max-h-[80vh]
                  overflow-y-auto border border-gray-200">
                  <div className="p-6">
                    <button
                      onClick={() => toggleCard(index)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    <div className="grid grid-cols-3 gap-6">
                      <div className="col-span-1">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h2>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className={`px-2 py-1 rounded-full text-sm font-medium
                            ${item.impact.toLowerCase() === 'high' ? 'bg-red-100 text-red-800' :
                              item.impact.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'}`}
                          >
                            {item.impact}
                          </span>
                          <span className="px-2 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                            {item.sector}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{item.description}</p>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                        >
                          Read full article
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                        <div className="mt-4 text-sm text-gray-500">
                          {item.source} • {new Date(item.publishedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="col-span-2">
                        {item.analysis && (
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Insights</h3>
                              <ul className="space-y-2">
                                {item.analysis.keyInsights.map((insight, i) => (
                                  <li key={i} className="flex items-start">
                                    <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 bg-blue-600 rounded-full mr-2"></span>
                                    <span className="text-gray-600">{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-3">Implications</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded shadow-sm">
                                  <h4 className="font-medium text-gray-900 mb-2">Short Term</h4>
                                  <p className="text-gray-600">{item.analysis.implications.shortTerm}</p>
                                </div>
                                <div className="bg-white p-4 rounded shadow-sm">
                                  <h4 className="font-medium text-gray-900 mb-2">Long Term</h4>
                                  <p className="text-gray-600">{item.analysis.implications.longTerm}</p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-3">Workforce Trends</h3>
                              <div className="flex flex-wrap gap-2">
                                {item.analysis.workforceTrends.map((trend, i) => (
                                  <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                                    {trend}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const content = loading ? (
    <div className="text-center py-10">Loading...</div>
  ) : error ? (
    <div className="bg-red-50 text-red-600 p-4 rounded">{error}</div>
  ) : (
    <MainContent />
  );

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
            <Link href="/" className="text-white">News</Link>
            <Link href="/knowledge-base" className="text-gray-300 hover:text-white">Knowledge Base</Link>
            <Link href="#" className="text-gray-300 hover:text-white">Reports</Link>
            <Link href="#" className="text-gray-300 hover:text-white">Analytics</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {content}
    </div>
  );
}
