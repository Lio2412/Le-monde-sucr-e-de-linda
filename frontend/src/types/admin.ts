export interface AdminStats {
  totalUsers: number;
  totalRecipes: number;
  pendingRecipes: number;
  totalComments: number;
  totalViews?: number;
  totalFavorites?: number;
  engagementRate?: number;
}

export interface PendingContent {
  id: string;
  type: 'recipe' | 'comment' | 'article';
  title: string;
  status: 'pending' | 'published' | 'rejected';
  createdAt: Date;
  authorId: string;
  authorName: string;
}

export interface AdminActivity {
  id: string;
  type: 'recipe' | 'comment' | 'article' | 'user';
  action: 'create' | 'update' | 'delete' | 'moderate';
  title: string;
  timestamp: Date;
  userId: string;
  userName: string;
}
