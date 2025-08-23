"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../ui/components/Header";
import { SearchAndFilters } from "../ui/components/SearchAndFilters";
import { PostCard } from "../ui/components/PostCard";
import { ImageModal } from "../ui/components/ImageModal";
import { LeaderboardService } from "../services/leaderboardService";
import { Post, Votes, SortOption, TimeFilter } from "../types";
import Link from "next/link";
import { IconX } from "@tabler/icons-react";

export default function LeaderboardPage() {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("trending");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [votes, setVotes] = useState<Votes>({});
  const [visiblePosts, setVisiblePosts] = useState<number>(6);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  // Fetch posts from database
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/posts`);
        if (!res.ok) throw new Error("Failed to fetch posts");
        const fetchedPosts: Post[] = await res.json();
        setFilteredPosts(fetchedPosts);
      } catch (error) {
        console.error("❌ Error fetching posts:", error);
        setFilteredPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [searchQuery, sortBy, timeFilter]);

  // Reset visible posts when filters change
  useEffect(() => {
    setVisiblePosts(6);
  }, [searchQuery, sortBy, timeFilter]);

  const handleVote = async (
    postId: number,
    type: "up" | "down"
  ): Promise<void> => {
    const current = votes[postId] || { up: false, down: false };
    const newVoteState = !current[type];

    // Update local state immediately for better UX
    setVotes((prev: Votes) => ({
      ...prev,
      [postId]: { ...current, [type]: newVoteState },
    }));

    // Update database
    try {
      await LeaderboardService.updateVote(postId, type, newVoteState);

      // Update the post in the filtered posts array
      setFilteredPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            let upvotes = post.upvotes;
            let downvotes = post.downvotes;

            if (type === "up") {
              if (newVoteState) upvotes += 1;
              else upvotes -= 1;
              if (current.down) downvotes -= 1; // remove opposite vote
            } else {
              if (newVoteState) downvotes += 1;
              else downvotes -= 1;
              if (current.up) upvotes -= 1; // remove opposite vote
            }

            return { ...post, upvotes, downvotes };
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Error updating vote:", error);
      // Revert local state on error
      setVotes((prev: Votes) => ({
        ...prev,
        [postId]: current,
      }));
    }
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
        await navigator.clipboard.writeText(
          `${post.title} - ${post.description}\n\nView this artwork: ${window.location.href}`
        );
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share failed:", error);
      // Final fallback - just copy to clipboard
      try {
        await navigator.clipboard.writeText(
          `${post.title} - ${post.description}`
        );
        alert("Link copied to clipboard!");
      } catch (clipboardError) {
        alert("Share failed. Please copy the URL manually.");
      }
    }
  };

  const handleLoadMore = (): void => {
    setVisiblePosts((prev) => Math.min(prev + 6, filteredPosts.length));
  };

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 1000
      ) {
        if (visiblePosts < filteredPosts.length && !isLoading) {
          handleLoadMore();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visiblePosts, filteredPosts.length, isLoading]);

  return (
    <div className="min-h-screen bg-[#fff8f0]">
      <Link href={"/"} className="fixed top-10 right-10 text-Secondary-Text hover:text-Primary-Text"><IconX /></Link>
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-25 to-amber-25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <Header />
          {/* <div className="mt-4"> */}
            {/* <SearchAndFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              timeFilter={timeFilter}
              onTimeFilterChange={setTimeFilter}
            />
          </div> */}
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {filteredPosts.length === 0 && !isLoading ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-32 h-32 mb-6 rounded-full bg-Accent flex items-center justify-center shadow-lg">
              <svg
                className="w-16 h-16 text-Accent-Dark"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-Primary-Text mb-2">
              No Artwork Found
            </h3>
            <p className="text-Secondary-Text mb-6 max-w-md">
              {searchQuery || timeFilter !== "all" || sortBy !== "trending"
                ? "No artwork matches your current filters. Try adjusting your search or filters."
                : "No artwork has been shared yet."}
            </p>
            {(searchQuery || timeFilter !== "all" || sortBy !== "trending") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSortBy("trending");
                  setTimeFilter("all");
                }}
                className="px-6 py-3 bg-Accent text-Primary-Text font-medium rounded-full hover:bg-Accent-Dark transition-all duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {filteredPosts
              .slice(0, visiblePosts)
              .map((post: Post, index: number) => (
                <PostCard
                  key={post.id}
                  post={post}
                  index={index}
                  votes={votes}
                  onVote={handleVote}
                  onComment={() => {}}
                  onShare={handleShare}
                  onImageClick={setSelectedImg}
                />
              ))}
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 text-Secondary-Text">
              <div className="w-4 h-4 border-2 border-Accent border-t-transparent rounded-full animate-spin"></div>
              Loading more artwork...
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      <ImageModal
        selectedImg={selectedImg}
        onClose={() => setSelectedImg(null)}
      />
    </div>
  );
}
