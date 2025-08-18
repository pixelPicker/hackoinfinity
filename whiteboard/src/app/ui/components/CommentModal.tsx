import React, { useState } from 'react';
import { X, Send, User } from 'lucide-react';

interface Comment {
  id: number;
  user: string;
  avatar: string;
  text: string;
  timestamp: string;
  replies?: Comment[];
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  postTitle: string;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  postId,
  postTitle,
}) => {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      user: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=100",
      text: "Amazing artwork! The colors are so vibrant.",
      timestamp: "2hr ago",
      replies: [
        {
          id: 2,
          user: "Dhiraj Woli",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
          text: "Thank you! I spent a lot of time on the color palette.",
          timestamp: "1hr ago",
        }
      ]
    },
    {
      id: 3,
      user: "Maya Chen",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      text: "Love the composition and lighting!",
      timestamp: "3hr ago",
    }
  ]);

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now(),
        user: "You",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
        text: newComment,
        timestamp: "Just now",
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">💬 Comments</h2>
            <p className="text-sm text-gray-600 font-medium">{postTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/80 rounded-full transition-all hover:scale-110 cursor-pointer bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[50vh]">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">💭</div>
              <p className="text-gray-500 text-lg">No comments yet</p>
              <p className="text-gray-400 text-sm">Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="space-y-4">
                {/* Main Comment */}
                <div className="flex gap-4">
                  <img
                    src={comment.avatar}
                    alt={comment.user}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div className="flex-1">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-gray-900 text-lg">{comment.user}</span>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">{comment.timestamp}</span>
                      </div>
                      <p className="text-gray-700 text-base leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-4 ml-16">
                    <img
                      src={reply.avatar}
                      alt={reply.user}
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                    />
                    <div className="flex-1">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">{reply.user}</span>
                          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">{reply.timestamp}</span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{reply.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Add Comment */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex gap-4">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
              alt="You"
              className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
            />
            <div className="flex-1 flex gap-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts on this artwork..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900 placeholder-gray-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
              />
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 font-semibold flex items-center gap-2"
              >
                <Send size={18} />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
