"use client";

import React, { useState, useMemo } from "react";
import { Header } from "../ui/components/Header";
import { SearchAndFilters } from "../ui/components/SearchAndFilters";
import { PostCard } from "../ui/components/PostCard";
import { ImageModal } from "../ui/components/ImageModal";


import { mockPosts } from "../data/mockData";
import { Post, Votes, SortOption, TimeFilter } from "../types";

export default function LeaderboardPage() {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("trending");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [votes, setVotes] = useState<Votes>({});
  const [visiblePosts, setVisiblePosts] = useState<number>(6);
  const [isLoading, setIsLoading] = useState<boolean>(false);


  const filteredAndSortedPosts = useMemo((): Post[] => {
    let filtered = mockPosts.filter((post: Post) =>
      [post.title, post.user].some((field) =>
        field.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    if (timeFilter !== "all") {
      const now = Date.now();
      filtered = filtered.filter((post: Post) => {
        const createdAt = new Date(post.createdAt).getTime();
        const timeDiff = now - createdAt;
        
        switch (timeFilter) {
          case "1h":
            return timeDiff <= 1 * 60 * 60 * 1000;
          case "24h":
            return timeDiff <= 24 * 60 * 60 * 1000;
          case "7d":
            return timeDiff <= 7 * 24 * 60 * 60 * 1000;
          case "30d":
            return timeDiff <= 30 * 24 * 60 * 60 * 1000;
          default:
            return true;
        }
      });
    }

    const sorted = [...filtered];
    switch (sortBy) {
      case "trending":
        sorted.sort((a, b) => {
          if (a.trending && !b.trending) return -1;
          if (!a.trending && b.trending) return 1;
          return b.upvotes - a.upvotes;
        });
        break;
      case "top":
        sorted.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case "recent":
        sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "views":
        sorted.sort((a, b) => b.views - a.views);
        break;
      default:
        break;
    }

    console.log('Filter Debug:', {
      searchQuery,
      sortBy,
      timeFilter,
      totalPosts: mockPosts.length,
      filteredCount: filtered.length,
      sortedCount: sorted.length,
      currentTime: new Date().toISOString(),
      samplePost: sorted[0] ? {
        id: sorted[0].id,
        title: sorted[0].title,
        createdAt: sorted[0].createdAt,
        time: sorted[0].time
      } : null
    });

    return sorted;
  }, [searchQuery, sortBy, timeFilter]);

  // Reset visible posts when filters change
  React.useEffect(() => {
    setVisiblePosts(6);
  }, [searchQuery, sortBy, timeFilter]);

  const handleVote = (postId: number, type: "up" | "down"): void => {
    setVotes((prev: Votes) => {
      const current = prev[postId] || { up: false, down: false };
      return {
        ...prev,
        [postId]: { ...current, [type]: !current[type] },
      };
    });
  };

  

  const handleShare = async (post: Post): Promise<void> => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.description,
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(`${post.title} - ${post.description}\n\nView this artwork: ${window.location.href}`);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
      // Final fallback - just copy to clipboard
      try {
        await navigator.clipboard.writeText(`${post.title} - ${post.description}`);
        alert('Link copied to clipboard!');
      } catch (clipboardError) {
        alert('Share failed. Please copy the URL manually.');
      }
    }
  };

  const handleLoadMore = (): void => {
    setIsLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setVisiblePosts(prev => Math.min(prev + 6, filteredAndSortedPosts.length));
      setIsLoading(false);
    }, 500);
  };

  // Infinite scroll effect
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000) {
        if (visiblePosts < filteredAndSortedPosts.length && !isLoading) {
          handleLoadMore();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visiblePosts, filteredAndSortedPosts.length, isLoading]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <Header />
          <SearchAndFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
          />
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {filteredAndSortedPosts.slice(0, visiblePosts).map((post, index) => (
                         <PostCard
               key={post.id}
               post={post}
               index={index}
               votes={votes}
               onVote={handleVote}
              
               onShare={handleShare}
               onImageClick={setSelectedImg}
             />
          ))}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              Loading more artwork...
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      <ImageModal selectedImg={selectedImg} onClose={() => setSelectedImg(null)} />

     
    </div>
  );
}
