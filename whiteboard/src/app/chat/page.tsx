'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Users, Circle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  username: string;
  userColor: string;
  timestamp: Date;
  type: 'message' | 'system';
}

interface User {
  id: string;
  username: string;
  color: string;
  isOnline: boolean;
}

export default function CollaborativeChatBox()  {
  // Mock users for demonstration
  const [users] = useState<User[]>([
    { id: '1', username: 'You', color: '#3B82F6', isOnline: true },
    { id: '2', username: 'Alice', color: '#10B981', isOnline: true },
    { id: '3', username: 'Bob', color: '#F59E0B', isOnline: true },
    { id: '4', username: 'Carol', color: '#EF4444', isOnline: false }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Alice joined the whiteboard',
      username: 'System',
      userColor: '#6B7280',
      timestamp: new Date(Date.now() - 5 * 60000),
      type: 'system'
    },
    {
      id: '2',
      text: 'Hey everyone! Ready to brainstorm?',
      username: 'Alice',
      userColor: '#10B981',
      timestamp: new Date(Date.now() - 4 * 60000),
      type: 'message'
    },
    {
      id: '3',
      text: 'Bob joined the whiteboard',
      username: 'System',
      userColor: '#6B7280',
      timestamp: new Date(Date.now() - 3 * 60000),
      type: 'system'
    },
    {
      id: '4',
      text: 'Absolutely! Let\'s start with the main concepts',
      username: 'Bob',
      userColor: '#F59E0B',
      timestamp: new Date(Date.now() - 2 * 60000),
      type: 'message'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const currentUser = users[0]; // "You" user

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (inputMessage.trim() === '') return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      username: currentUser.username,
      userColor: currentUser.color,
      timestamp: new Date(),
      type: 'message'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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

          {/* Online Users */}
          <div className="bg-gray-50 p-3 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Users size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Collaborators</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {users.map((user) => (
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
              ))}
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div key={message.id}>
                {message.type === 'system' ? (
                  <div className="text-center">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {message.text}
                    </span>
                  </div>
                ) : (
                  <div className={`flex flex-col ${message.username === currentUser.username ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1 mb-1">
                      <span 
                        className="text-xs font-medium"
                        style={{ color: message.userColor }}
                      >
                        {message.username}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                        message.username === currentUser.username
                          ? 'bg-blue-500 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                )}
              </div>
            ))}
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={inputMessage.trim() === ''}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
              >
                <Send size={16} />
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
};
