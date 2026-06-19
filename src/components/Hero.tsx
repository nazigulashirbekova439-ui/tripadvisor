import React, { useState, useRef, useEffect } from 'react';
import { Search, Bed, Compass, Utensils, Home, Plane, MapPin, Star } from 'lucide-react';
import { DESTINATIONS } from '../data';
import { Destination } from '../types';

interface HeroProps {
  onSearch: (cityId: string, category: string) => void;
  selectedCityId: string;
}

type SearchCategory = 'all' | 'hotel' | 'attraction' | 'restaurant' | 'rental';

export default function Hero({ onSearch, selectedCityId }: HeroProps) {
  const [activeTab, setActiveTab] = useState<SearchCategory>('all');
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<Destination[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter destinations based on query
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const filtered = DESTINATIONS.filter(
      (d) =>
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.country.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered);
  }, [query]);

  // Handle outside click to close suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (dest: Destination) => {
    setQuery(`${dest.name}, ${dest.country}`);
    setShowDropdown(false);
    onSearch(dest.id, activeTab);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Find if current query matches a known destination accurately, otherwise use first match
    const matched = DESTINATIONS.find((d) => d.name.toLowerCase().includes(query.toLowerCase()));
    if (matched) {
      onSearch(matched.id, activeTab);
    } else {
      // Default to paris if no match found
      onSearch('paris', activeTab);
    }
  };

  const tabs = [
    { id: 'all', label: 'Search All', icon: Search },
    { id: 'hotel', label: 'Hotels', icon: Bed },
    { id: 'attraction', label: 'Things to Do', icon: Compass },
    { id: 'restaurant', label: 'Restaurants', icon: Utensils },
    { id: 'rental', label: 'Vacation Rentals', icon: Home },
  ];

  return (
    <div className="relative bg-white pb-6 pt-4 sm:pb-12 sm:pt-8 border-b border-gray-100">
      {/* Decorative Warm Accent Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-72 bg-gradient-to-b from-emerald-50/40 via-yellow-50/10 to-transparent -z-10 rounded-b-[40px]" />

      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Callout */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-black tracking-tight leading-none mb-4 animate-fade-in">
          Where to?
        </h1>
        <p className="text-gray-500 text-sm sm:text-base md:text-lg mb-8 max-w-lg mx-auto font-medium">
          Compare hotels, explore incredible restaurants, build custom itineraries, and search thousands of organic traveler reviews.
        </p>

        {/* Categories Tab Row */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar px-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as SearchCategory);
                  if (selectedCityId) {
                    onSearch(selectedCityId, tab.id);
                  }
                }}
                className={`flex items-center space-x-2 px-4 py-3 rounded-full text-xs sm:text-sm font-bold shrink-0 transition-all duration-300 transform active:scale-95 ${
                  isSelected
                    ? 'bg-black text-white shadow-md'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isSelected ? 'text-[#34E0A1]' : 'text-gray-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input search submit bar */}
        <div ref={containerRef} className="relative max-w-2xl mx-auto z-40">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-white border-2 border-gray-200 focus-within:border-black rounded-full p-1.5 shadow-lg focus-within:shadow-xl transition-all"
          >
            <div className="flex items-center flex-1 px-3">
              <Search className="w-5 h-5 text-gray-400 shrink-0 mr-2" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Places to go, things to do, hotels..."
                className="w-full text-sm sm:text-base outline-hidden text-black placeholder-gray-400 py-1.5 font-medium"
              />
            </div>
            <button
              type="submit"
              className="bg-[#00AA6C] hover:bg-[#008f5d] text-white px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-extrabold shadow-xs transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Autocomplete Dropdown suggestions list */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden text-left z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {suggestions.length > 0 ? (
                <div className="py-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-1.5">
                    Suggested Destinations
                  </p>
                  {suggestions.map((dest) => (
                    <button
                      key={dest.id}
                      onClick={() => handleSuggestionClick(dest)}
                      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                        <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">{dest.name}</p>
                        <p className="text-xs text-gray-500">{dest.country}</p>
                      </div>
                      <div className="flex items-center text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md">
                        <Star className="w-3 h-3 fill-emerald-600 mr-1" />
                        <span>{dest.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : query.trim() ? (
                <div className="px-4 py-5 text-center text-gray-400">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium">No destinations found matching &quot;{query}&quot;</p>
                  <p className="text-xs text-gray-400 mt-1">Try Paris, Tokyo, Rome, Bali, or New York</p>
                </div>
              ) : (
                <div className="py-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-1.5">
                    Popular Destinations
                  </p>
                  {DESTINATIONS.map((dest) => (
                    <button
                      key={dest.id}
                      onClick={() => handleSuggestionClick(dest)}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <span className="text-sm font-bold text-gray-900">{dest.name}</span>
                        <span className="text-xs text-gray-400 ml-2">({dest.country})</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick selection cities row */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500">
          <span className="font-semibold">Quick Search:</span>
          {DESTINATIONS.map((dest) => (
            <button
              key={dest.id}
              onClick={() => onSearch(dest.id, activeTab)}
              className={`px-3 py-1 rounded-full border transition-all ${
                selectedCityId === dest.id
                  ? 'border-emerald-500 bg-emerald-50/50 text-[#00AA6C] font-semibold'
                  : 'border-gray-200 hover:border-gray-400 hover:text-black bg-white'
              }`}
            >
              {dest.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
