import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type KnowledgeItem = {
  id: string;
  title: string;
  content: string;
  category: string;
  date_added: string;
  last_updated: string;
  tags?: string[];
  connections?: string[];
}

export type KnowledgeTag = {
  id: string;
  knowledge_item_id: string;
  tag: string;
}

export type KnowledgeConnection = {
  id: string;
  source_item_id: string;
  target_item_id: string;
  connection_strength: number;
}

export async function fetchKnowledgeItems() {
  const { data: items, error: itemsError } = await supabase
    .from('knowledge_items')
    .select('*');

  if (itemsError) {
    console.error('Error fetching items:', itemsError);
    return [];
  }

  // Fetch tags for all items
  const { data: tags, error: tagsError } = await supabase
    .from('knowledge_tags')
    .select('*');

  if (tagsError) {
    console.error('Error fetching tags:', tagsError);
    return items;
  }

  // Fetch connections for all items
  const { data: connections, error: connectionsError } = await supabase
    .from('knowledge_connections')
    .select('*');

  if (connectionsError) {
    console.error('Error fetching connections:', connectionsError);
    return items;
  }

  // Combine the data
  return items.map(item => ({
    ...item,
    tags: tags
      .filter(tag => tag.knowledge_item_id === item.id)
      .map(tag => tag.tag),
    connections: connections
      .filter(conn => conn.source_item_id === item.id)
      .map(conn => conn.target_item_id)
  }));
}

export async function createKnowledgeItem(
  item: Omit<KnowledgeItem, 'id' | 'date_added' | 'last_updated' | 'tags' | 'connections'> & { tags: string[] }
) {
  // Insert the main item
  const { data: newItem, error: itemError } = await supabase
    .from('knowledge_items')
    .insert([{
      title: item.title,
      content: item.content,
      category: item.category
    }])
    .select()
    .single();

  if (itemError) {
    console.error('Error creating item:', itemError);
    return null;
  }

  // Insert tags
  if (item.tags.length > 0) {
    const { error: tagsError } = await supabase
      .from('knowledge_tags')
      .insert(
        item.tags.map(tag => ({
          knowledge_item_id: newItem.id,
          tag: tag
        }))
      );

    if (tagsError) {
      console.error('Error creating tags:', tagsError);
    }
  }

  return newItem;
}

export async function detectConnections(itemId: string) {
  // Fetch the item's content
  const { data: item, error: itemError } = await supabase
    .from('knowledge_items')
    .select('*')
    .eq('id', itemId)
    .single();

  if (itemError) {
    console.error('Error fetching item:', itemError);
    return;
  }

  // Fetch all other items
  const { data: otherItems, error: othersError } = await supabase
    .from('knowledge_items')
    .select('*')
    .neq('id', itemId);

  if (othersError) {
    console.error('Error fetching other items:', othersError);
    return;
  }

  // Simple keyword matching for now
  const itemWords = new Set(
    (item.title + ' ' + item.content)
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 4)
  );

  const connections = otherItems
    .map(other => {
      const otherWords = new Set(
        (other.title + ' ' + other.content)
          .toLowerCase()
          .split(/\W+/)
          .filter(word => word.length > 4)
      );
      
      const commonWords = [...itemWords].filter(word => otherWords.has(word));
      return {
        source_item_id: itemId,
        target_item_id: other.id,
        connection_strength: commonWords.length / Math.sqrt(itemWords.size * otherWords.size)
      };
    })
    .filter(conn => conn.connection_strength > 0.1);

  if (connections.length > 0) {
    const { error: connectionError } = await supabase
      .from('knowledge_connections')
      .insert(connections);

    if (connectionError) {
      console.error('Error creating connections:', connectionError);
    }
  }
}
