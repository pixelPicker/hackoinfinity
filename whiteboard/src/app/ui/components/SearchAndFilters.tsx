import React from 'react';
import { Search } from 'lucide-react';
import { SortOption, TimeFilter } from '../../types/index';

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  timeFilter: TimeFilter;
  onTimeFilterChange: (value: TimeFilter) => void;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  timeFilter,
  onTimeFilterChange,
}) => {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Search bar - compact on mobile when scrolled */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder={isScrolled ? "Search..." : "Search artwork, artists, or categories..."}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`w-full pl-10 pr-4 bg-gray-50  border text-black  border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-text ${
            isScrolled ? 'py-2 text-sm' : 'py-2.5 sm:py-3'
          }`}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {/* Mobile: Icon-based filters when scrolled, text when at top */}
        <div className="flex sm:hidden gap-2 ">
                     <button
             onClick={() => onSortChange('trending')}
             className={`p-2 rounded-lg tranjsition-all  cursor-pointer ${
               sortBy === 'trending' 
                 ? 'bg-orange-500 text-white border border-orange-600 shadow-lg' 
                 : 'bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300 hover:border-orange-400'
             }`}
             title="Trending"
           >
             {isScrolled ? '🔥' : '🔥 Trending'}
           </button>
           <button
             onClick={() => onSortChange('top')}
             className={`p-2 rounded-lg transition-all cursor-pointer ${
               sortBy === 'top' 
                 ? 'bg-yellow-500 text-white border border-yellow-600 shadow-lg' 
                 : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border border-yellow-300 hover:border-yellow-400'
             }`}
             title="Top Rated"
           >
             {isScrolled ? '🏆' : '🏆 Top'}
           </button>
           <button
             onClick={() => onSortChange('recent')}
             className={`p-2 rounded-lg transition-all cursor-pointer ${
               sortBy === 'recent' 
                 ? 'bg-blue-500 text-white border border-blue-600 shadow-lg' 
                 : 'bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 hover:border-blue-400'
             }`}
             title="Recent"
           >
             {isScrolled ? '🕒' : '🕒 Recent'}
           </button>
           <button
             onClick={() => onSortChange('views')}
             className={`p-2 rounded-lg transition-all cursor-pointer ${
               sortBy === 'views' 
                 ? 'bg-green-500 text-white border border-green-600 shadow-lg' 
                 : 'bg-green-100 hover:bg-green-200 text-green-700 border border-green-300 hover:border-green-400'
             }`}
             title="Most Viewed"
           >
             {isScrolled ? '👀' : '👀 Views'}
           </button>
        </div>

        {/* Desktop: Full dropdowns */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="hidden sm:block px-3 sm:px-4 py-2.5 sm:py-3 bg-purple-100 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer text-black"
        >
          <option value="trending" className="text-black bg-white">🔥 Trending</option>
          <option value="top" className="text-black bg-white">🏆 Top Rated</option>
          <option value="recent" className="text-black bg-white">🕒 Recent</option>
          <option value="views" className="text-black bg-white">👀 Most Viewed</option>
        </select>
        
        {/* Mobile: Compact time filter - icons when scrolled */}
        <div className="flex sm:hidden gap-2">
          <button
            onClick={() => onTimeFilterChange('all')}
            className={`px-2 py-2 rounded-lg text-xs transition-all cursor-pointer ${
              timeFilter === 'all' 
                ? 'bg-indigo-500 text-white border border-indigo-600 shadow-lg' 
                : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border border-indigo-300 hover:border-indigo-400'
            }`}
          >
            {isScrolled ? '∞' : 'All'}
          </button>
          <button
            onClick={() => onTimeFilterChange('1h')}
            className={`px-2 py-2 rounded-lg text-xs transition-all cursor-pointer ${
              timeFilter === '1h' 
                ? 'bg-red-500 text-white border border-red-600 shadow-lg' 
                : 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 hover:border-red-400'
            }`}
          >
            {isScrolled ? '⏰' : '1h'}
          </button>
          <button
            onClick={() => onTimeFilterChange('24h')}
            className={`px-2 py-2 rounded-lg text-xs transition-all cursor-pointer ${
              timeFilter === '24h' 
                ? 'bg-orange-500 text-white border border-orange-600 shadow-lg' 
                : 'bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300 hover:border-orange-400'
            }`}
          >
            {isScrolled ? '🌅' : '24h'}
          </button>
          <button
            onClick={() => onTimeFilterChange('7d')}
            className={`px-2 py-2 rounded-lg text-xs transition-all cursor-pointer ${
              timeFilter === '7d' 
                ? 'bg-purple-500 text-white border border-purple-600 shadow-lg' 
                : 'bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-300 hover:border-purple-400'
            }`}
          >
            {isScrolled ? '📅' : '7d'}
          </button>
        </div>

        {/* Desktop: Full time filter dropdown */}
        <select
          value={timeFilter}
          onChange={(e) => onTimeFilterChange(e.target.value as TimeFilter)}
          className="hidden sm:block px-3 sm:px-4 py-2.5 sm:py-3 bg-purple-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer text-black"
        >
          <option value="all" className="text-black bg-white">All Time</option>
          <option value="1h" className="text-black bg-white">Past Hour</option>
          <option value="24h" className="text-black bg-white">Past Day</option>
          <option value="7d" className="text-black bg-white">Past Week</option>
          <option value="30d" className="text-black bg-white">Past Month</option>
        </select>
      </div>
    </div>
  );
};