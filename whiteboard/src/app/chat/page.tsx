'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Users, Circle } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Message {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    color: string;
  };
  createdAt: string;
  type: 'message' | 'system';
}

interface User {
  id: string;
  username: string;
  color: string;
  isOnline: boolean;
}

interface CollaborativeChatBoxProps {
  drawingId?: number;
  chatRoomId?: string;
}

export default function CollaborativeChatBox({ 
  drawingId, 
  chatRoomId: initialChatRoomId 
}: CollaborativeChatBoxProps) {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [chatRoomId, setChatRoomId] = useState<string>(initialChatRoomId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chat room
  useEffect(() => {
    const initializeChatRoom = async () => {
      if (drawingId && !chatRoomId) {
        try {
          const response = await fetch(`/api/chat/rooms?drawingId=${drawingId}`);
          const data = await response.json();
          
          if (response.ok) {
            setChatRoomId(data.id);
          } else {
            setError(data.error || 'Failed to initialize chat room');
          }
        } catch (error) {
          setError('Failed to connect to chat room');
        }
      }
    };

    initializeChatRoom();
  }, [drawingId, chatRoomId]);

  // Fetch messages
  const fetchMessages = async () => {
    if (!chatRoomId) return;

    try {
      const response = await fetch(`/api/chat/messages?chatRoomId=${chatRoomId}`);
      const data = await response.json();
      
      if (response.ok) {
        setMessages(data);
      } else {
        setError(data.error || 'Failed to fetch messages');
      }
    } catch (error) {
      setError('Failed to fetch messages');
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    if (!chatRoomId) return;

    try {
      const response = await fetch(`/api/chat/users?chatRoomId=${chatRoomId}`);
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (error) {
      setError('Failed to fetch users');
    }
  };

  // Load data when chat room is ready
  useEffect(() => {
    if (chatRoomId) {
      fetchMessages();
      fetchUsers();
    }
  }, [chatRoomId]);

  // Poll for new messages and users every 5 seconds
  useEffect(() => {
    if (!chatRoomId) return;

    const interval = setInterval(() => {
      fetchMessages();
      fetchUsers();
    }, 5000);

    return () => clearInterval(interval);
  }, [chatRoomId]);

  const sendMessage = async () => {
    if (inputMessage.trim() === '' || !chatRoomId || !session) return;

    setLoading(true);
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: inputMessage,
          chatRoomId,
          type: 'message'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Add the new message to the local state immediately
        setMessages(prev => [...prev, data]);
        setInputMessage('');
        setError(null);
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch (error) {
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCurrentUser = () => {
    if (!session?.user) return null;
    return users.find(user => user.id === session.user?.id) || {
      id: 'current',
      username: session.user.name || 'You',
      color: '#3B82F6',
      isOnline: true
    };
  };

  const currentUser = getCurrentUser();

  if (!session) {
    return (
      <div className="fixed right-4 top-4 bg-yellow-100 border border-yellow-300 rounded-lg p-4 max-w-sm">
        <p className="text-sm text-yellow-800">Please sign in to use the chat feature.</p>
      </div>
    );
  }

  return (
    <>
      {/* Chat Container */}
      <div
        className={`fixed right-0 top-0 h-full z-50 transition-transform duration-300 ease-in-out ${
          isChatVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="bg-white shadow-2xl border-l border-gray-200 h-full w-80 flex flex-col">
          {/* Chat Header */}
          <div className="bg-amber-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <h3 className="font-semibold">Team Chat</h3>
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                {users.filter(u => u.isOnline).length} online
              </span>
            </div>
            <button
              onClick={() => setIsChatVisible(false)}
              className="hover:bg-white/20 p-1 rounded transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-b border-red-200 p-2">
              <p className="text-xs text-red-600">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="text-xs text-red-500 hover:text-red-700 mt-1"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Online Users */}
          <div className="bg-gray-50 p-3 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Collaborators</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {users.length > 0 ? users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border"
                >
                  <Circle
                    size={8}
                    className={`${user.isOnline ? 'fill-green-500 text-green-500' : 'fill-gray-300 text-gray-300'}`}
                  />
                  <span 
                    className="text-xs font-medium"
                    style={{ color: user.color }}
                  >
                    {user.username}
                  </span>
                </div>
              )) : (
                <span className="text-xs text-gray-500">Loading users...</span>
              )}
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length > 0 ? messages.map((message) => (
              <div key={message.id}>
                {message.type === 'system' ? (
                  <div className="text-center">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {message.content}
                    </span>
                  </div>
                ) : (
                  <div className={`flex flex-col ${message.author.id === currentUser?.id ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1 mb-1">
                      <span 
                        className="text-xs font-medium"
                        style={{ color: message.author.color }}
                      >
                        {message.author.name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                        message.author.id === currentUser?.id
                          ? 'bg-blue-500 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                )}
              </div>
            )) : (
              <div className="text-center text-gray-500 text-sm">
                {chatRoomId ? 'No messages yet. Start the conversation!' : 'Loading messages...'}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={loading || !chatRoomId}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100"
              />
              <button
                onClick={sendMessage}
                disabled={inputMessage.trim() === '' || loading || !chatRoomId}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      {/* Chat Toggle Button (appears when chat is hidden) */}
      {!isChatVisible && (
        <div
          className="fixed right-0 top-1/2 transform -translate-y-1/2 z-40"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button
            onClick={() => setIsChatVisible(true)}
            className={`bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-l-lg shadow-lg transition-all duration-300 ${
              isHovered ? 'translate-x-0' : 'translate-x-8'
            }`}
          >
            <MessageCircle size={24} />
          </button>
        </div>
      )}

      {/* Hover Area (invisible area to trigger chat appearance) */}
      {!isChatVisible && (
        <div
          className="fixed right-0 top-0 w-12 h-full z-30"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
      )}
    </>
  );
}