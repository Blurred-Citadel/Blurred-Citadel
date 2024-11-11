export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  summary: string;
  source: {
    type: 'news' | 'pdf' | 'web';
    url?: string;
    originalContent?: string;
  };
  category: string;
  tags: string[];
  connections: string[];
  aiAnalysis: {
    keyTopics: string[];
    sentiment: string;
    relevanceScore: number;
    suggestedConnections: string[];
  };
  dateAdded: string;
  lastUpdated: string;
}
