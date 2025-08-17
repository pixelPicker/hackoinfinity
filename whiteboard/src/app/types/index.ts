// types/index.ts
export interface Post {
  id: number;
  user: string;
  avatar: string;
  time: string;        // human-readable, for display only
  createdAt: string;   // ISO timestamp, for sorting/filtering
  views: number;
  title: string;
  description: string;
  img: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  shares: number;
  trending: boolean;
}


export interface Votes {
  [postId: number]: {
    up?: boolean;
    down?: boolean;
  };
}

export type SortOption = "trending" | "top" | "recent" | "views";
export type TimeFilter = "all" | "1h" | "24h" | "7d" | "30d";