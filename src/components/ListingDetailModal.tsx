import React, { useState, useMemo } from 'react';
import { X, MapPin, Globe, Phone, Calendar, Users, Heart, Star, Sparkles, Send, Search, Check, ThumbsUp, Trash2 } from 'lucide-react';
import { Listing, Review } from '../types';

interface ListingDetailModalProps {
  listing: Listing;
  reviews: Review[];
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
  onAddReview: (review: Omit<Review, 'id' | 'date'>) => void;
  onDeleteReview: (reviewId: string) => void;
  currentUser: { name: string; avatar: string; location: string } | null;
  onPromptLogin: () => void;
}

export default function ListingDetailModal({
  listing,
  reviews,
  isFavorite,
  onToggleFavorite,
  onClose,
  onAddReview,
  onDeleteReview,
  currentUser,
  onPromptLogin
}: ListingDetailModalProps) {
  // Booking panel states
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-07-05');
  const [guests, setGuests] = useState(2);
  const [isBooked, setIsBooked] = useState(false);
  const [confCode, setConfCode] = useState('');

  // Review interaction states
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewFilterRating, setReviewFilterRating] = useState<number | 'all'>('all');
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});

  // Form states for posting a new review
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState('');
  const [formText, setFormText] = useState('');
  const [showReviewSuccess, setShowReviewSuccess] = useState(false);

  // Parse check-in, check-out for calculation
  const nights = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) ? 1 : diffDays;
  }, [startDate, endDate]);

  const bookingTotal = useMemo(() => {
    return listing.price * nights * (listing.category === 'hotel' || listing.category === 'rental' ? 1 : guests);
  }, [listing.price, nights, guests, listing.category]);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setConfCode(result);
    setIsBooked(true);
  };

  const handleReviewLike = (id: string) => {
    setLikedReviews((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onPromptLogin();
      return;
    }
    if (!formTitle.trim() || !formText.trim()) return;

    onAddReview({
      listingId: listing.id,
      title: formTitle,
      rating: formRating,
      text: formText,
      authorName: currentUser.name,
      authorLocation: currentUser.location,
      userAvatar: currentUser.avatar
    });

    setFormTitle('');
    setFormText('');
    setFormRating(5);
    setShowReviewSuccess(true);
    setTimeout(() => setShowReviewSuccess(false), 3000);
  };

  // Filter reviews by rating or text matches
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchRating = reviewFilterRating === 'all' || r.rating === reviewFilterRating;
      const matchText =
        r.title.toLowerCase().includes(reviewSearch.toLowerCase()) ||
        r.text.toLowerCase().includes(reviewSearch.toLowerCase()) ||
        r.authorName.toLowerCase().includes(reviewSearch.toLowerCase());
      return matchRating && matchText;
    });
  }, [reviews, reviewFilterRating, reviewSearch]);

  const ratingStatistics = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (r.rating in counts) {
        counts[r.rating as keyof typeof counts]++;
      }
    });
    return counts;
  }, [reviews]);

  const ratingPercentage = (count: number) => {
    if (reviews.length === 0) return 0;
    return Math.round((count / reviews.length) * 100);
  };

  // Render TripAdvisor green rating bubbles helper
  const renderBubbles = (r: number, size: 'small' | 'medium' | 'large' = 'medium') => {
    const bubbles = [];
    const classNameMap = {
      small: 'rating-bubble-small',
      medium: 'rating-bubble',
      large: 'rating-bubble-large'
    };
    const activeClass = classNameMap[size];

    for (let i = 1; i <= 5; i++) {
      if (i <= r) {
        bubbles.push(<span key={i} className={`${activeClass} filled`} />);
      } else {
        bubbles.push(<span key={i} className={activeClass} />);
      }
    }
    return <div className="flex items-center space-x-0.5">{bubbles}</div>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-3">
            <span className="bg-black text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md">
              {listing.category}
            </span>
            <div className="hidden sm:flex items-center space-x-1.5 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>{listing.location}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Heart toggler */}
            <button
              onClick={onToggleFavorite}
              className={`p-2.5 rounded-full transition-all border ${
                isFavorite
                  ? 'bg-rose-50 border-rose-200 text-rose-500'
                  : 'bg-white border-gray-200 text-gray-400 hover:text-black hover:border-gray-400'
              }`}
            >
              <Heart className={`w-4.5 h-4.5 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
            {/* Close btn */}
            <button
              onClick={onClose}
              className="p-2.5 bg-white border border-gray-200 hover:border-black rounded-full text-gray-500 hover:text-black transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container split in Column layouts */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Main content column */}
          <div className="lg:col-span-8 p-6 space-y-6">
            
            {/* Headings & Meta */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-black leading-tight mb-2">
                {listing.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  {renderBubbles(listing.rating)}
                  <span className="text-xs text-emerald-800 font-extrabold">{listing.rating}</span>
                </div>
                <span className="text-xs text-gray-400 font-semibold">•</span>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">
                  {reviews.length} written reviews
                </span>
              </div>
            </div>

            {/* Panorama visual illustration and thumbnails */}
            <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 shadow-md">
              <img
                src={listing.image}
                alt={listing.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                <p className="text-xs font-semibold backdrop-blur-md bg-black/40 px-3 py-1.5 rounded-full flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span>Verified Guest Imagery</span>
                </p>
                <span className="text-xs font-semibold backdrop-blur-md bg-black/40 px-3 py-1.5 rounded-full">
                  1 / 1 Photo
                </span>
              </div>
            </div>

            {/* Overview write-up details */}
            <div className="space-y-3">
              <h2 className="text-lg font-extrabold text-black tracking-tight">About this destination</h2>
              <p className="text-sm text-gray-600 leading-relaxed font-normal">
                {listing.description}
              </p>

              {/* Specific features badges row */}
              <div className="pt-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Popular Features Offered</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium text-gray-700 bg-gray-50 border border-gray-150 px-3.5 py-1.5 rounded-xl shadow-xs"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Reviews Segment */}
            <div className="border-t border-gray-100 pt-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-black tracking-tight">Traveler Reviews</h2>
                  <p className="text-xs text-gray-400 font-medium">Read true experiences submitted by other validated travelers</p>
                </div>

                {/* Filter and search block */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={reviewSearch}
                      onChange={(e) => setReviewSearch(e.target.value)}
                      placeholder="Search within reviews..."
                      className="pl-9 pr-4 py-2 border border-gray-200 focus:border-black rounded-lg text-xs outline-hidden w-full sm:w-48 transition-all"
                    />
                  </div>
                  <select
                    value={reviewFilterRating}
                    onChange={(e) => {
                      const val = e.target.value;
                      setReviewFilterRating(val === 'all' ? 'all' : Number(val));
                    }}
                    className="px-3 py-2 border border-gray-200 focus:border-black rounded-lg text-xs outline-hidden bg-white"
                  >
                    <option value="all">All Stars</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              </div>

              {/* Rating chart breakdown grids */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200/60 pb-4 md:pb-0 md:pr-4 text-center">
                  <p className="text-4xl font-black text-emerald-800 leading-none">{listing.rating}</p>
                  <div className="my-1.5">{renderBubbles(listing.rating)}</div>
                  <p className="text-xs font-extrabold text-gray-500 uppercase tracking-widest mt-1">Excellent average</p>
                </div>

                <div className="md:col-span-8 space-y-1.5">
                  {([5, 4, 3, 2, 1] as const).map((r) => {
                    const count = ratingStatistics[r] || 0;
                    const percent = ratingPercentage(count);
                    return (
                      <div key={r} className="flex items-center space-x-2 text-xs">
                        <span className="w-12 text-gray-500 shrink-0 text-left font-bold">{r} Bubble{r > 1 ? 's' : ''}</span>
                        <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="bg-[#00AA6C] h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-gray-500 font-semibold">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review submit card form */}
              <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs">
                <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-3">
                  Write your own experience
                </h3>
                {currentUser ? (
                  <form onSubmit={handleAddReviewSubmit} className="space-y-4">
                    {/* Circle buttons rating Selection */}
                    <div className="flex items-center space-x-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="text-xs font-bold text-gray-600">Your Rating Bubble count:</span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormRating(star)}
                            className="p-1 focus:outline-none focus:scale-110 active:scale-95 transition-transform"
                          >
                            <span
                              className={`inline-block w-6 h-6 rounded-full border-2 border-[#00AA6C] cursor-pointer ${
                                star <= formRating ? 'bg-[#00AA6C]' : 'bg-transparent'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        required
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="Summarize your visit in one sentence..."
                        className="w-full px-4 py-2.5 border border-gray-200 focus:border-black rounded-xl text-sm outline-hidden font-semibold transition-all"
                      />
                      <textarea
                        required
                        rows={3}
                        value={formText}
                        onChange={(e) => setFormText(e.target.value)}
                        placeholder="Describe the hospitality, decor, prices, and what went well or poorly..."
                        className="w-full px-4 py-3 border border-gray-200 focus:border-black rounded-xl text-sm outline-hidden transition-all"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <p className="text-[10px] text-gray-400">
                        Posting as <span className="font-bold">{currentUser.name}</span>
                      </p>
                      <button
                        type="submit"
                        className="flex items-center space-x-2 bg-black hover:bg-emerald-700 text-white px-5 py-2 rounded-full text-xs font-bold transition-all hover:scale-105"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post Review</span>
                      </button>
                    </div>

                    {showReviewSuccess && (
                      <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-3 rounded-xl border border-emerald-100 flex items-center space-x-2 animate-in fade-in">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Thank you! Your review was successfully published dynamically.</span>
                      </div>
                    )}
                  </form>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-xs text-gray-500 mb-3">Sign in to write reviews or plan customized itineraries.</p>
                    <button
                      onClick={onPromptLogin}
                      className="bg-black text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
                    >
                      Sign In Now
                    </button>
                  </div>
                )}
              </div>

              {/* Feed of filteredReviews items list */}
              <div className="space-y-4">
                {filteredReviews.length > 0 ? (
                  filteredReviews.map((rev) => {
                    const isLiked = !!likedReviews[rev.id];
                    return (
                      <div
                        key={rev.id}
                        className="border border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition-colors bg-white shadow-2xs space-y-3 relative group"
                      >
                        {/* Title & Bubbles */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <h4 className="text-sm font-extrabold text-black tracking-tight leading-snug">
                            {rev.title}
                          </h4>
                          <div>{renderBubbles(rev.rating, 'small')}</div>
                        </div>

                        {/* Review text */}
                        <p className="text-xs text-gray-600 leading-relaxed font-normal">
                          {rev.text}
                        </p>

                        {/* User author tag bar */}
                        <div className="pt-2 flex items-center justify-between border-t border-gray-50">
                          <div className="flex items-center space-x-3.5">
                            {rev.userAvatar ? (
                              <img
                                src={rev.userAvatar}
                                alt={rev.authorName}
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#00AA6C] flex items-center justify-center font-bold text-xs capitalize">
                                {rev.authorName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold text-gray-800 leading-tight">
                                {rev.authorName}
                              </p>
                              {rev.authorLocation && (
                                <p className="text-[10px] text-gray-400">{rev.authorLocation}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3.5 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                            <span>{rev.date}</span>
                            <button
                              onClick={() => handleReviewLike(rev.id)}
                              className={`flex items-center space-x-1 hover:text-rose-500 transition-colors ${
                                isLiked ? 'text-rose-500 font-extrabold' : ''
                              }`}
                            >
                              <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
                              <span>{isLiked ? 'Helpful!' : 'Helpful'}</span>
                            </button>
                            {/* Delete of own reviews option if username matches */}
                            {currentUser && rev.authorName === currentUser.name && (
                              <button
                                onClick={() => onDeleteReview(rev.id)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs font-semibold">No reviews matching the filters</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar checkout panels column */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-gray-100 p-6 bg-gray-50/50">
            <div className="sticky top-6 space-y-6">
              
              {/* Main Booking Card panel */}
              <div className="bg-white border border-gray-150 rounded-3xl p-5 shadow-lg relative overflow-hidden">
                {!isBooked ? (
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                        Price Estimate
                      </span>
                      <p className="text-lg font-black text-black">
                        ${listing.price}
                        <span className="text-xs text-gray-500 font-medium">
                          {listing.category === 'hotel' || listing.category === 'rental' ? ' / night' : ' / guest'}
                        </span>
                      </p>
                    </div>

                    {/* Inputs */}
                    {(listing.category === 'hotel' || listing.category === 'rental') ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Check-In</label>
                          <div className="relative">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="date"
                              required
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="pl-8 pr-2 py-2 border border-gray-200 rounded-xl text-xs w-full focus:outline-hidden focus:border-black font-semibold"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Check-Out</label>
                          <div className="relative">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="date"
                              required
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="pl-8 pr-2 py-2 border border-gray-200 rounded-xl text-xs w-full focus:outline-hidden focus:border-black font-semibold"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Reservation Date</label>
                        <div className="relative">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="date"
                            required
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="pl-8 pr-2 py-2 border border-gray-200 rounded-xl text-xs w-full focus:outline-hidden focus:border-black font-semibold"
                          />
                        </div>
                      </div>
                    )}

                    {/* Guests selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Guests</label>
                      <div className="relative">
                        <Users className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                          value={guests}
                          onChange={(e) => setGuests(Number(e.target.value))}
                          className="pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-xs w-full focus:outline-hidden focus:border-black font-semibold bg-white"
                        >
                          <option value="1">1 Guest</option>
                          <option value="2">2 Guests</option>
                          <option value="3">3 Guests</option>
                          <option value="4">4 Guests</option>
                          <option value="5">5 Guests</option>
                        </select>
                      </div>
                    </div>

                    {/* Cost ledger rows */}
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Rate base</span>
                        <span>${listing.price}</span>
                      </div>
                      
                      {(listing.category === 'hotel' || listing.category === 'rental') && (
                        <div className="flex justify-between text-gray-600">
                          <span>Duration multiplier</span>
                          <span>{nights} night{nights > 1 ? 's' : ''}</span>
                        </div>
                      )}

                      {!(listing.category === 'hotel' || listing.category === 'rental') && (
                        <div className="flex justify-between text-gray-600">
                          <span>Guest multiplier</span>
                          <span>{guests} guest{guests > 1 ? 's' : ''}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-gray-600">
                        <span>Taxes &amp; Service fees</span>
                        <span>Included</span>
                      </div>
                      <div className="h-px bg-gray-200 my-1" />
                      <div className="flex justify-between font-extrabold text-black">
                        <span>Estimated Total</span>
                        <span>${bookingTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#00AA6C] hover:bg-[#008f5d] text-white py-3.5 rounded-full text-sm font-extrabold shadow-md hover:shadow-lg transition-all"
                    >
                      {listing.category === 'hotel' || listing.category === 'rental' ? 'Book Stay Now' : 'Confirm Reservation'}
                    </button>
                    <p className="text-[10px] text-gray-400 text-center">
                      Secure checkouts. Zero fee reservation holds.
                    </p>
                  </form>
                ) : (
                  <div className="text-center py-6 space-y-4 animate-in fade-in duration-300">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 ring-4 ring-emerald-50">
                      <Check className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-black leading-tight">Stay successfully booked!</h4>
                      <p className="text-xs text-gray-500 mt-1">Your reservation is confirmed. See details below:</p>
                    </div>

                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-xs text-left space-y-2 font-medium text-emerald-900">
                      <p><strong>Place:</strong> {listing.name}</p>
                      {(listing.category === 'hotel' || listing.category === 'rental') ? (
                        <p><strong>Dates:</strong> {startDate} to {endDate} ({nights} nights)</p>
                      ) : (
                        <p><strong>Date:</strong> {startDate}</p>
                      )}
                      <p><strong>Guests:</strong> {guests} person{guests > 1 ? 's' : ''}</p>
                      <p><strong>Cost value:</strong> ${bookingTotal.toLocaleString()}</p>
                      <div className="border-t border-emerald-200 my-1.5 pt-1.5 flex justify-between uppercase tracking-wider font-extrabold text-[10px]">
                        <span>COUPON CODE</span>
                        <span className="text-[#00aa6c]">{confCode}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setIsBooked(false)}
                        className="text-xs font-bold text-gray-500 hover:text-black py-2 underline"
                      >
                        Book another deal
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Assistance support information container */}
              <div className="bg-white border border-gray-150 rounded-2xl p-4 text-xs space-y-3.5">
                <h4 className="font-extrabold text-black uppercase tracking-wider">Contact &amp; Details</h4>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="underline hover:text-black cursor-pointer truncate">
                      www.{listing.id}.com
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>+33 (0)1 53 67 19 98</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-[#00aa6c] shrink-0" />
                    <span className="truncate">{listing.location}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
