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
  onComment,
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
      case 0: return "text-yellow-500 bg-yellow-50";
      case 1: return "text-gray-500 bg-gray-50";
      case 2: return "text-amber-600 bg-amber-50";
      default: return "text-blue-500 bg-blue-50";
    }
  };

  return (
    <div className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 relative">
      {/* Rank Badge */}
      <div className={`absolute top-4 left-4 z-10 px-3 py-2 rounded-full text-sm font-bold shadow-lg ${getRankColor(index)}`}>
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
            <h3 className="font-bold text-gray-900 text-lg mb-1">{post.user}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar size={14} className="text-gray-500" />
                <span className="font-medium">{post.time}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={14} className="text-gray-500" />
                <span className="font-medium">{formatViews(post.views)} views</span>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hover:scale-110 cursor-pointer">
            <MoreHorizontal size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Title and Description */}
        <h2 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 leading-tight">
          {post.title}
        </h2>
        <p className="text-gray-700 text-sm mb-4 line-clamp-2 leading-relaxed">
          {post.description}
        </p>

                {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 bg-gray-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onVote(post.id, 'up')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105 font-semibold cursor-pointer ${
                votes[post.id]?.up 
                  ? 'bg-green-500 text-white border border-green-600 shadow-lg' 
                  : 'bg-green-100 hover:bg-green-200 text-green-700 border border-green-300 hover:border-green-400'
              }`}
            >
              <ArrowBigUp size={20} />
              <span className="text-sm font-bold">
                {post.upvotes + (votes[post.id]?.up ? 1 : 0)}
              </span>
            </button>
            
            <button
              onClick={() => onVote(post.id, 'down')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105 font-semibold cursor-pointer ${
                votes[post.id]?.down 
                  ? 'bg-red-500 text-white border border-red-600 shadow-lg' 
                  : 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 hover:border-red-400'
              }`}
            >
              <ArrowBigDown size={20} />
              <span className="text-sm font-bold">{post.downvotes}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => onComment(post.id)}
              className="flex items-center gap-2 text-blue-700 bg-blue-100 hover:bg-blue-200 transition-all px-3 py-2 rounded-xl font-medium cursor-pointer border border-blue-300 hover:border-blue-400"
            >
              <MessageCircle size={18} />
              <span className="text-sm font-semibold">{post.comments}</span>
            </button>
            
            <button 
              onClick={() => onShare(post)}
              className="p-2 rounded-xl text-purple-700 bg-purple-100 hover:bg-purple-200 transition-all hover:scale-110 cursor-pointer border border-purple-300 hover:border-purple-400"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};