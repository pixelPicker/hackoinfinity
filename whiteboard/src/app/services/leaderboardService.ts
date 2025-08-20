import { Post } from '../types';

export class LeaderboardService {
  // Get all posts with user data for leaderboard
  static async getPosts(): Promise<Post[]> {
    try {
      const response = await fetch('/api/posts');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  // Get filtered and sorted posts
  static async getFilteredPosts(
    searchQuery: string = '',
    sortBy: 'trending' | 'top' | 'recent' | 'views' = 'trending',
    timeFilter: 'all' | '1h' | '24h' | '7d' | '30d' = 'all'
  ): Promise<Post[]> {
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        sort: sortBy,
        time: timeFilter,
      });

      const response = await fetch(`/api/posts?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch filtered posts');
      }
      
      const posts = await response.json();
      return this.filterPostsClientSide(posts, searchQuery, sortBy, timeFilter);
    } catch (error) {
      console.error('Error fetching filtered posts:', error);
      return [];
    }
  }

  // Client-side filtering as fallback
  private static filterPostsClientSide(
    posts: Post[],
    searchQuery: string,
    sortBy: 'trending' | 'top' | 'recent' | 'views',
    timeFilter: 'all' | '1h' | '24h' | '7d' | '30d'
  ): Post[] {
    let filtered = [...posts];

    // Apply time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      let timeThreshold: Date;

      switch (timeFilter) {
        case '1h':
          timeThreshold = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          timeThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          timeThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          timeThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          timeThreshold = new Date(0);
      }

      filtered = filtered.filter(post => new Date(post.createdAt) >= timeThreshold);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        post.user.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'trending':
        filtered.sort((a, b) => {
          if (a.trending && !b.trending) return -1;
          if (!a.trending && b.trending) return 1;
          return b.upvotes - a.upvotes;
        });
        break;
      case 'top':
        filtered.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'views':
        filtered.sort((a, b) => b.views - a.views);
        break;
    }

    return filtered;
  }

  // Update post vote counts
  static async updateVote(postId: number, type: 'up' | 'down', increment: boolean): Promise<void> {
    try {
      const response = await fetch('/api/posts/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          type,
          increment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update vote');
      }
    } catch (error) {
      console.error('Error updating vote:', error);
    }
  }

  // Increment view count
  static async incrementViews(postId: number): Promise<void> {
    try {
      const response = await fetch('/api/posts/views', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to increment views');
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }

  // Helper function to format time ago
  private static formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}hr ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months}mo ago`;
    }
  }
}
