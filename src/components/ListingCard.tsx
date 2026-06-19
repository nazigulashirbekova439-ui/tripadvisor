import React from 'react';
import { Listing } from '../types';
import { Heart, Tag, MapPin, Sparkles } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClick: () => void;
}

const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isFavorite,
  onToggleFavorite,
  onClick
}) => {
  // Helper to render authentic TripAdvisor green rating bubbles (5 circles total)
  const renderRatingBubbles = (rating: number) => {
    const bubbles = [];
    const fullBubbles = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullBubbles) {
        // Fully filled
        bubbles.push(
          <span key={i} className="rating-bubble-small filled" />
        );
      } else if (i === fullBubbles + 1 && hasHalf) {
        // Half filled - simulated by a special CSS background or styling,
        // or simply rendered filled since TripAdvisor bubbles can have half states.
        // Let's render as partially filled or represented as a custom styled element
        bubbles.push(
          <span key={i} className="rating-bubble-small relative inline-block overflow-hidden">
            <span className="absolute top-0 left-0 bottom-0 right-1/2 bg-[#00AA6C]" />
          </span>
        );
      } else {
        // Empty bubble
        bubbles.push(<span key={i} className="rating-bubble-small" />);
      }
    }
    return <div className="flex items-center space-x-0.5">{bubbles}</div>;
  };

  const getPriceLabel = () => {
    switch (listing.category) {
      case 'hotel':
        return `from $${listing.price}/night`;
      case 'restaurant':
        return `from $${listing.price}/meal`;
      case 'attraction':
        return `from $${listing.price}/ticket`;
      case 'rental':
        return `from $${listing.price}/night`;
      default:
        return `$${listing.price}`;
    }
  };

  const getCategoryTheme = () => {
    switch (listing.category) {
      case 'hotel':
        return { bg: 'bg-indigo-50 text-indigo-700', label: 'Hotel' };
      case 'restaurant':
        return { bg: 'bg-emerald-50 text-emerald-700', label: 'Restaurant' };
      case 'attraction':
        return { bg: 'bg-amber-50 text-amber-700', label: 'Attraction' };
      case 'rental':
        return { bg: 'bg-rose-50 text-rose-700', label: 'Rental' };
    }
  };

  const theme = getCategoryTheme();

  return (
    <div
      onClick={onClick}
      className="group flex flex-col bg-white border border-gray-100 rounded-3xl overflow-hidden cursor-pointer shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full"
    >
      {/* Image Container with Badge and Heart Toggles */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-50">
        <img
          src={listing.image}
          alt={listing.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Favorite Heart Trigger */}
        <button
          onClick={onToggleFavorite}
          className="absolute top-3.5 right-3.5 p-2 bg-white/90 hover:bg-white text-gray-500 hover:text-rose-600 rounded-full shadow-md z-10 transition-all hover:scale-110 active:scale-95"
        >
          <Heart
            className={`w-4.5 h-4.5 transition-colors duration-300 ${
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-600'
            }`}
          />
        </button>

        {/* Category Label Overlay */}
        <span className={`absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${theme.bg} shadow-md`}>
          {theme.label}
        </span>

        {/* Premium Badge if review count is high */}
        {listing.reviewCount > 1000 && (
          <div className="absolute bottom-3 left-3 flex items-center bg-black/75 backdrop-blur-xs text-yellow-400 text-[10px] font-bold px-2 py-1 rounded-md space-x-1 shadow-sm">
            <Sparkles className="w-3 h-3 fill-yellow-400" />
            <span>Best Seller</span>
          </div>
        )}
      </div>

      {/* Details Area */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Header & Title */}
          <h3 className="text-base sm:text-lg font-bold text-black group-hover:text-[#00AA6C] line-clamp-1 transition-colors leading-snug">
            {listing.name}
          </h3>

          {/* Location link row */}
          <div className="flex items-center text-xs text-gray-500 mt-1 mb-2.5">
            <MapPin className="w-3 h-3 mr-1 text-[#00AA6C] shrink-0" />
            <span className="truncate">{listing.location}</span>
          </div>

          {/* Rating circle bar */}
          <div className="flex items-center space-x-2 mb-3">
            {renderRatingBubbles(listing.rating)}
            <span className="text-xs text-gray-400 font-medium">
              {listing.reviewCount.toLocaleString()} reviews
            </span>
          </div>

          {/* Highlights bullets list */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {listing.features.slice(0, 2).map((feat, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100 uppercase tracking-wide"
              >
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing tag Row */}
        <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Estimated price</span>
          <div className="text-right">
            <p className="text-sm font-extrabold text-gray-900">{getPriceLabel()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
