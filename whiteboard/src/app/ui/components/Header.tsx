import React from 'react';
import { Trophy, Palette, Star } from 'lucide-react';

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
    <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl p-6 mb-6 border border-orange-200/50 shadow-lg">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-200/30 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-200/30 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
      
      {/* Main content */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Icon group */}
          <div className="flex items-center gap-2">
            <div className="p-3 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
              <Trophy className="text-white" size={28} />
            </div>
            <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl shadow-md transform -rotate-2 hover:rotate-1 transition-transform duration-300">
              <Palette className="text-white" size={20} />
            </div>
          </div>
          
          {/* Title section */}
          <div className="ml-2">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800 tracking-tight">
                Art Leaderboard
              </h1>
              <div className="flex gap-1">
                <Star className="text-yellow-500 fill-yellow-500" size={20} />
                <Star className="text-yellow-500 fill-yellow-500" size={16} />
                <Star className="text-yellow-500 fill-yellow-500" size={12} />
              </div>
            </div>
            <p className={`text-gray-600 text-sm sm:text-base font-medium transition-all duration-300 ${
              isScrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
            }`}>
              🎨 Discover amazing artwork • Vote for your favorites • Join the creative community
            </p>
          </div>
        </div>
        
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400"></div>
    </div>
  );
};