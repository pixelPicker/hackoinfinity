import React from 'react';
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Calendar,
  Eye,
} from 'lucide-react';
import { Post, Votes } from '../../types';

interface PostCardProps {
  post: Post;
  index: number;
  votes: Votes;
  onVote: (postId: number, type: 'up' | 'down') => void;
  onComment: (postId: number) => void;
  onShare: (post: Post) => void;
  onImageClick: (img: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  index,
  votes,
  onVote,
  // onComment,
  onShare,
  onImageClick,
}) => {
  const formatViews = (views: number): string => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const getRankColor = (index: number): string => {
    switch (index) {
      case 0: return "text-yellow-600 bg-gradient-to-br from-yellow-200 to-yellow-300 border-2 border-yellow-400 shadow-lg";
      case 1: return "text-gray-600 bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-gray-400 shadow-lg";
      case 2: return "text-amber-700 bg-gradient-to-br from-amber-200 to-amber-300 border-2 border-amber-400 shadow-lg";
      default: return "text-Accent-Dark bg-gradient-to-br from-Accent to-Accent-Dark border-2 border-white shadow-lg";
    }
  };

  return (
    <div className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-Accent/30 hover:border-Accent/50 relative hover:scale-[1.02]">
      {/* Rank Badge */}
      <div className={`absolute top-4 left-4 z-10 px-4 py-2 rounded-full text-sm font-bold ${getRankColor(index)}`}>
        #{index + 1}
      </div>

      {/* Image */}
      <div
        className="relative w-full h-56 sm:h-64 cursor-pointer overflow-hidden"
        onClick={() => onImageClick(post.img)}
        style={{ cursor: 'pointer' }}
      >
        <img
          src={post.img}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={post.avatar}
            alt={post.user}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 shadow-sm"
          />
          <div className="flex-1">
            <h3 className="font-bold text-Primary-Text text-lg mb-1">{post.user}</h3>
            <div className="flex items-center gap-3 text-sm text-Secondary-Text">
              <div className="flex items-center gap-1">
                <Calendar size={14} className="text-Accent-Dark" />
                <span className="font-medium">{post.time}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={14} className="text-Accent-Dark" />
                <span className="font-medium">{formatViews(post.views)} views</span>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-Accent/20 rounded-full transition-colors hover:scale-110 cursor-pointer">
            <MoreHorizontal size={18} className="text-Secondary-Text" />
          </button>
        </div>

        {/* Title and Description */}
        <h2 className="font-bold text-xl text-Primary-Text mb-3 line-clamp-2 leading-tight">
          {post.title}
        </h2>
        <p className="text-Secondary-Text text-sm mb-4 line-clamp-2 leading-relaxed">
          {post.description}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-Accent/20 bg-gradient-to-r from-Accent/10 to-Accent/5 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 rounded-b-3xl">
          <div className="flex items-center gap-3 justify-center">
            <button
              onClick={() => {onVote(post.id, 'up')
                console.log("Post upvote/downvote");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105 font-semibold cursor-pointer ${
                votes[post.id]?.up 
                  ? 'bg-gradient-to-r from-green-400 to-green-500 text-white border-2 border-green-600 shadow-lg' 
                  : 'bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-700 border-2 border-green-300 hover:border-green-400'
              }`}
            >
              <ArrowBigUp size={20} />
            </button>
            
            <button
              onClick={() => onVote(post.id, 'down')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105 font-semibold cursor-pointer ${
                votes[post.id]?.down 
                  ? 'bg-gradient-to-r from-red-400 to-red-500 text-white border-2 border-red-600 shadow-lg' 
                  : 'bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 text-red-700 border-2 border-red-300 hover:border-red-400'
              }`}
            >
              <ArrowBigDown size={20} />
            </button>
            <button 
              onClick={() => onShare(post)}
              className="p-2 rounded-xl text-Accent-Dark bg-gradient-to-r from-Accent/30 to-Accent/50 hover:from-Accent/50 hover:to-Accent/70 transition-all hover:scale-110 cursor-pointer border-2 border-Accent hover:border-Accent-Dark"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};