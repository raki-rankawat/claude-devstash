/**
 * Single source of truth for dashboard mock data.
 * Temporary stand-in for the database — replace with Prisma queries later.
 */

export type ContentType = 'TEXT' | 'FILE' | 'URL';

export interface ItemType {
  id: string;
  name: string;
  label: string;
  icon: string; // lucide-react icon name
  color: string;
  contentType: ContentType;
  route: string;
  itemCount: number;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  itemCount: number;
  defaultTypeId: string; // drives the card accent colour
  typeIds: string[]; // type icons shown on the card
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  contentType: ContentType;
  content: string | null;
  url: string | null;
  fileName: string | null;
  fileSize: number | null;
  language: string | null;
  typeId: string;
  collectionIds: string[];
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isPro: boolean;
}

export const currentUser: User = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  image: null,
  isPro: true,
};

export const itemTypes: ItemType[] = [
  {
    id: 'type-snippet',
    name: 'snippet',
    label: 'Snippets',
    icon: 'Code',
    color: '#3b82f6',
    contentType: 'TEXT',
    route: '/items/snippets',
    itemCount: 24,
  },
  {
    id: 'type-prompt',
    name: 'prompt',
    label: 'Prompts',
    icon: 'Sparkles',
    color: '#8b5cf6',
    contentType: 'TEXT',
    route: '/items/prompts',
    itemCount: 18,
  },
  {
    id: 'type-command',
    name: 'command',
    label: 'Commands',
    icon: 'Terminal',
    color: '#f97316',
    contentType: 'TEXT',
    route: '/items/commands',
    itemCount: 15,
  },
  {
    id: 'type-note',
    name: 'note',
    label: 'Notes',
    icon: 'StickyNote',
    color: '#fde047',
    contentType: 'TEXT',
    route: '/items/notes',
    itemCount: 12,
  },
  {
    id: 'type-file',
    name: 'file',
    label: 'Files',
    icon: 'File',
    color: '#6b7280',
    contentType: 'FILE',
    route: '/items/files',
    itemCount: 5,
  },
  {
    id: 'type-image',
    name: 'image',
    label: 'Images',
    icon: 'Image',
    color: '#ec4899',
    contentType: 'FILE',
    route: '/items/images',
    itemCount: 3,
  },
  {
    id: 'type-link',
    name: 'link',
    label: 'Links',
    icon: 'Link',
    color: '#10b981',
    contentType: 'URL',
    route: '/items/links',
    itemCount: 8,
  },
];

export const collections: Collection[] = [
  {
    id: 'col-react-patterns',
    name: 'React Patterns',
    description: 'Common React patterns and hooks',
    isFavorite: true,
    itemCount: 12,
    defaultTypeId: 'type-snippet',
    typeIds: ['type-snippet', 'type-note', 'type-link'],
    createdAt: '2024-01-02T10:00:00.000Z',
    updatedAt: '2024-01-15T09:30:00.000Z',
  },
  {
    id: 'col-python-snippets',
    name: 'Python Snippets',
    description: 'Useful Python code snippets',
    isFavorite: false,
    itemCount: 8,
    defaultTypeId: 'type-snippet',
    typeIds: ['type-snippet', 'type-note'],
    createdAt: '2024-01-03T11:20:00.000Z',
    updatedAt: '2024-01-11T16:45:00.000Z',
  },
  {
    id: 'col-context-files',
    name: 'Context Files',
    description: 'AI context files for projects',
    isFavorite: true,
    itemCount: 5,
    defaultTypeId: 'type-file',
    typeIds: ['type-file', 'type-note'],
    createdAt: '2024-01-04T08:15:00.000Z',
    updatedAt: '2024-01-14T12:00:00.000Z',
  },
  {
    id: 'col-interview-prep',
    name: 'Interview Prep',
    description: 'Technical interview preparation',
    isFavorite: false,
    itemCount: 24,
    defaultTypeId: 'type-note',
    typeIds: ['type-note', 'type-snippet', 'type-link', 'type-prompt'],
    createdAt: '2024-01-05T14:05:00.000Z',
    updatedAt: '2024-01-13T18:10:00.000Z',
  },
  {
    id: 'col-git-commands',
    name: 'Git Commands',
    description: 'Frequently used git commands',
    isFavorite: true,
    itemCount: 15,
    defaultTypeId: 'type-command',
    typeIds: ['type-command', 'type-note'],
    createdAt: '2024-01-06T09:40:00.000Z',
    updatedAt: '2024-01-12T10:25:00.000Z',
  },
  {
    id: 'col-ai-prompts',
    name: 'AI Prompts',
    description: 'Curated AI prompts for coding',
    isFavorite: false,
    itemCount: 18,
    defaultTypeId: 'type-prompt',
    typeIds: ['type-prompt', 'type-snippet', 'type-note'],
    createdAt: '2024-01-07T13:00:00.000Z',
    updatedAt: '2024-01-10T15:55:00.000Z',
  },
];

export const items: Item[] = [
  {
    id: 'item-1',
    title: 'useAuth Hook',
    description: 'Custom authentication hook for React applications',
    contentType: 'TEXT',
    content: `import { useContext } from 'react'
import { AuthContext } from './AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}`,
    url: null,
    fileName: null,
    fileSize: null,
    language: 'typescript',
    typeId: 'type-snippet',
    collectionIds: ['col-react-patterns'],
    tags: ['react', 'auth', 'hooks'],
    isFavorite: true,
    isPinned: true,
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: 'item-2',
    title: 'API Error Handling Pattern',
    description: 'Fetch wrapper with exponential backoff retry logic',
    contentType: 'TEXT',
    content: `export async function fetchWithRetry(url: string, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(res.statusText)
      return res.json()
    } catch (error) {
      if (attempt === retries - 1) throw error
      await new Promise((r) => setTimeout(r, 2 ** attempt * 200))
    }
  }
}`,
    url: null,
    fileName: null,
    fileSize: null,
    language: 'typescript',
    typeId: 'type-snippet',
    collectionIds: ['col-react-patterns', 'col-interview-prep'],
    tags: ['fetch', 'errors', 'retry'],
    isFavorite: false,
    isPinned: true,
    createdAt: '2024-01-12T09:20:00.000Z',
    updatedAt: '2024-01-12T09:20:00.000Z',
  },
  {
    id: 'item-3',
    title: 'Code Review Prompt',
    description: 'Ask an LLM for a thorough review of a pull request diff',
    contentType: 'TEXT',
    content: `You are a senior engineer reviewing a pull request.
Focus on correctness, security and edge cases.
For each finding give the file, the risk and a concrete fix.`,
    url: null,
    fileName: null,
    fileSize: null,
    language: null,
    typeId: 'type-prompt',
    collectionIds: ['col-ai-prompts'],
    tags: ['review', 'ai'],
    isFavorite: true,
    isPinned: false,
    createdAt: '2024-01-11T15:30:00.000Z',
    updatedAt: '2024-01-11T15:30:00.000Z',
  },
  {
    id: 'item-4',
    title: 'Undo Last Commit',
    description: 'Drop the most recent commit but keep the changes staged',
    contentType: 'TEXT',
    content: 'git reset --soft HEAD~1',
    url: null,
    fileName: null,
    fileSize: null,
    language: 'bash',
    typeId: 'type-command',
    collectionIds: ['col-git-commands'],
    tags: ['git', 'reset'],
    isFavorite: false,
    isPinned: false,
    createdAt: '2024-01-10T08:45:00.000Z',
    updatedAt: '2024-01-10T08:45:00.000Z',
  },
  {
    id: 'item-5',
    title: 'Prune Merged Branches',
    description: 'Delete local branches that have already been merged',
    contentType: 'TEXT',
    content: "git branch --merged | grep -v '\\*' | xargs -n 1 git branch -d",
    url: null,
    fileName: null,
    fileSize: null,
    language: 'bash',
    typeId: 'type-command',
    collectionIds: ['col-git-commands'],
    tags: ['git', 'cleanup'],
    isFavorite: false,
    isPinned: false,
    createdAt: '2024-01-09T17:10:00.000Z',
    updatedAt: '2024-01-09T17:10:00.000Z',
  },
  {
    id: 'item-6',
    title: 'Postgres Index Notes',
    description: 'When a partial index beats a composite one',
    contentType: 'TEXT',
    content: `## Indexing notes

- Composite indexes only help when the query uses the leftmost columns.
- Partial indexes shine on skewed boolean columns (e.g. is_archived = false).
- Always check EXPLAIN ANALYZE before and after.`,
    url: null,
    fileName: null,
    fileSize: null,
    language: null,
    typeId: 'type-note',
    collectionIds: ['col-interview-prep'],
    tags: ['postgres', 'performance'],
    isFavorite: false,
    isPinned: false,
    createdAt: '2024-01-08T12:00:00.000Z',
    updatedAt: '2024-01-08T12:00:00.000Z',
  },
  {
    id: 'item-7',
    title: 'Debounce in Python',
    description: 'Decorator that debounces repeated calls',
    contentType: 'TEXT',
    content: `import threading

def debounce(wait):
    def decorator(fn):
        timer = None
        def debounced(*args, **kwargs):
            nonlocal timer
            if timer:
                timer.cancel()
            timer = threading.Timer(wait, fn, args, kwargs)
            timer.start()
        return debounced
    return decorator`,
    url: null,
    fileName: null,
    fileSize: null,
    language: 'python',
    typeId: 'type-snippet',
    collectionIds: ['col-python-snippets'],
    tags: ['python', 'utils'],
    isFavorite: false,
    isPinned: false,
    createdAt: '2024-01-07T11:15:00.000Z',
    updatedAt: '2024-01-07T11:15:00.000Z',
  },
  {
    id: 'item-8',
    title: 'project-context.md',
    description: 'Architecture context file handed to the AI assistant',
    contentType: 'FILE',
    content: null,
    url: null,
    fileName: 'project-context.md',
    fileSize: 18432,
    language: null,
    typeId: 'type-file',
    collectionIds: ['col-context-files'],
    tags: ['context', 'docs'],
    isFavorite: false,
    isPinned: false,
    createdAt: '2024-01-06T16:20:00.000Z',
    updatedAt: '2024-01-06T16:20:00.000Z',
  },
  {
    id: 'item-9',
    title: 'Dashboard Wireframe',
    description: 'Reference layout for the dashboard shell',
    contentType: 'FILE',
    content: null,
    url: null,
    fileName: 'dashboard-wireframe.png',
    fileSize: 402118,
    language: null,
    typeId: 'type-image',
    collectionIds: [],
    tags: ['design', 'ui'],
    isFavorite: false,
    isPinned: false,
    createdAt: '2024-01-05T10:05:00.000Z',
    updatedAt: '2024-01-05T10:05:00.000Z',
  },
  {
    id: 'item-10',
    title: 'Next.js App Router Docs',
    description: 'Official routing, layouts and server component reference',
    contentType: 'URL',
    content: null,
    url: 'https://nextjs.org/docs/app',
    fileName: null,
    fileSize: null,
    language: null,
    typeId: 'type-link',
    collectionIds: ['col-react-patterns'],
    tags: ['nextjs', 'docs'],
    isFavorite: true,
    isPinned: false,
    createdAt: '2024-01-04T09:00:00.000Z',
    updatedAt: '2024-01-04T09:00:00.000Z',
  },
];
