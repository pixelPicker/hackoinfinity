import React from 'react';
import { Award } from 'lucide-react';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex items-center mb-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
          <Award className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Drawing Leaderboard
          </h1>
          <p className={`text-gray-600 text-xs sm:text-sm transition-all duration-300 ${
            isScrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
          }`}>
            Discover amazing artwork from talented artists
          </p>
        </div>
      </div>
    </div>
  );
};