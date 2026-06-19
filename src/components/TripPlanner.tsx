import React, { useState, useMemo } from 'react';
import { DESTINATIONS, LISTINGS } from '../data';
import { TripPlan, TripItem, Listing, ListingCategory } from '../types';
import { Calendar, DollarSign, Plus, Trash2, MapPin, Smile, MoreVertical, Compass, ShieldAlert, ArrowLeft, PenTool, Check } from 'lucide-react';

interface TripPlannerProps {
  plans: TripPlan[];
  onCreatePlan: (plan: Omit<TripPlan, 'id' | 'items'>) => void;
  onUpdatePlan: (plan: TripPlan) => void;
  onDeletePlan: (planId: string) => void;
  favorites: string[]; // Listing IDs
  onSelectListing: (listing: Listing) => void;
}

export default function TripPlanner({
  plans,
  onCreatePlan,
  onUpdatePlan,
  onDeletePlan,
  favorites,
  onSelectListing
}: TripPlannerProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(plans.length > 0 ? plans[0].id : null);
  
  // Creation form states
  const [cityId, setCityId] = useState('paris');
  const [startDate, setStartDate] = useState('2026-07-20');
  const [endDate, setEndDate] = useState('2026-07-24');
  const [budget, setBudget] = useState(2000);

  // Active planning sub-states
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [showItemSelector, setShowItemSelector] = useState<{ day: number; slot: 'morning' | 'afternoon' | 'evening' } | null>(null);

  // Auto select newly created plan
  const selectedPlan = useMemo(() => {
    return plans.find((p) => p.id === selectedPlanId) || null;
  }, [plans, selectedPlanId]);

  // Compute number of days in the selected trip plan
  const planDaysCount = useMemo(() => {
    if (!selectedPlan) return 1;
    const start = new Date(selectedPlan.startDate);
    const end = new Date(selectedPlan.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
    return isNaN(diffDays) ? 1 : diffDays;
  }, [selectedPlan]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dest = DESTINATIONS.find((d) => d.id === cityId);
    if (!dest) return;

    // Call create
    onCreatePlan({
      destinationName: dest.name,
      cityId: dest.id,
      startDate,
      endDate,
      budget
    });

    // We will auto-track the updated selection in App.tsx side effects
  };

  // Sync selection to first plan if none selected or if selected got deleted
  React.useEffect(() => {
    if (plans.length > 0 && (!selectedPlanId || !plans.some(p => p.id === selectedPlanId))) {
      setSelectedPlanId(plans[0].id);
    } else if (plans.length === 0) {
      setSelectedPlanId(null);
    }
  }, [plans, selectedPlanId]);

  // Total cost calculator
  const totalCost = useMemo(() => {
    if (!selectedPlan) return 0;
    return selectedPlan.items.reduce((sum, item) => sum + item.price, 0);
  }, [selectedPlan]);

  const budgetProgress = useMemo(() => {
    if (!selectedPlan || selectedPlan.budget === 0) return 0;
    return Math.min(100, Math.round((totalCost / selectedPlan.budget) * 100));
  }, [selectedPlan, totalCost]);

  // Get available items for selector popover matching city and slot type
  const availableListingsForSelector = useMemo(() => {
    if (!selectedPlan) return [];
    return LISTINGS.filter((l) => l.cityId === selectedPlan.cityId);
  }, [selectedPlan]);

  const addActivityToPlan = (listing: Listing, dayIndex: number, timeSlot: 'morning' | 'afternoon' | 'evening') => {
    if (!selectedPlan) return;

    const newItem: TripItem = {
      id: `item-${Date.now()}`,
      listingId: listing.id,
      title: listing.name,
      category: listing.category,
      price: listing.price,
      dayIndex,
      timeSlot,
      notes: '',
      image: listing.image
    };

    const updatedPlan: TripPlan = {
      ...selectedPlan,
      items: [...selectedPlan.items, newItem]
    };

    onUpdatePlan(updatedPlan);
    setShowItemSelector(null);
  };

  const removeActivityFromPlan = (itemId: string) => {
    if (!selectedPlan) return;

    const updatedPlan: TripPlan = {
      ...selectedPlan,
      items: selectedPlan.items.filter((item) => item.id !== itemId)
    };

    onUpdatePlan(updatedPlan);
  };

  const updateItemNotes = (itemId: string, notes: string) => {
    if (!selectedPlan) return;

    const updatedPlan: TripPlan = {
      ...selectedPlan,
      items: selectedPlan.items.map((item) => (item.id === itemId ? { ...item, notes } : item))
    };

    onUpdatePlan(updatedPlan);
  };

  const currentDayItems = useMemo(() => {
    if (!selectedPlan) return [];
    return selectedPlan.items.filter((item) => item.dayIndex === activeDayIdx);
  }, [selectedPlan, activeDayIdx]);

  return (
    <div className="bg-white min-h-[75vh]">
      {!selectedPlan ? (
        /* Empty/Onboarding State: Create a new plan */
        <div className="max-w-3xl mx-auto px-4 py-8 sm:py-16 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100 shadow-sm mb-6">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-black tracking-tight mb-2">
            Create your custom travel itinerary
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto mb-8 font-medium">
            Plan hotels, schedule lunches, track activities day-by-day, and manage your budget live in a single unified dashboard.
          </p>

          <form
            onSubmit={handleCreateSubmit}
            className="bg-gray-50 border border-gray-150 p-6 sm:p-8 rounded-3xl text-left shadow-md space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Choose Destination
                </label>
                <select
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-hidden font-bold bg-white focus:border-black"
                >
                  {DESTINATIONS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}, {d.country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Trip Budget Estimate ($)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-gray-505 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="100"
                    max="50000"
                    required
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-hidden font-bold focus:border-black"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Departing Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-hidden font-semibold focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Return Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-hidden font-semibold focus:border-black"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full bg-[#00AA6C] hover:bg-[#008f5d] text-white py-4 rounded-full text-base font-extrabold shadow-md hover:shadow-lg transition-all text-center cursor-pointer"
              >
                Create Vacation Workspace
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Plan Workspace Dashboard active state */
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10 space-y-6">
          
          {/* Active plans pick header bar */}
          <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-widest pl-1">Your Trips:</span>
              <div className="flex flex-wrap gap-1.5">
                {plans.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => {
                      setSelectedPlanId(pl.id);
                      setActiveDayIdx(0);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      selectedPlanId === pl.id
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-150 hover:bg-gray-50'
                    }`}
                  >
                    {pl.destinationName}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setSelectedPlanId(null);
                }}
                className="px-4 py-2 border border-gray-200 rounded-full text-xs font-bold text-gray-700 hover:border-black bg-white transition-all shrink-0"
              >
                + Plan New City
              </button>
              <button
                onClick={() => {
                  if (selectedPlan) {
                    onDeletePlan(selectedPlan.id);
                  }
                }}
                className="px-3 py-2 border border-red-200 hover:bg-red-50 hover:border-red-400 text-red-500 rounded-full text-xs font-bold transition-all shrink-0"
              >
                Delete This Trip
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left stats and controls column: 4 columns */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Trip Metadata summary container */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active Workspace Plan</p>
                  <h2 className="text-2xl font-black text-black leading-tight mt-1">{selectedPlan.destinationName} Itinerary</h2>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Hold dates:</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    {selectedPlan.startDate} to {selectedPlan.endDate}
                  </span>
                </div>

                {/* Budget ledger with warning triggers */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end text-xs">
                    <span className="text-gray-500 font-bold uppercase tracking-wider">Costs calculation</span>
                    <span className="text-sm font-black text-gray-900">
                      ${totalCost.toLocaleString()} <span className="text-gray-400 font-light">/ ${selectedPlan.budget.toLocaleString()}</span>
                    </span>
                  </div>

                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        totalCost > selectedPlan.budget ? 'bg-orange-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${budgetProgress}%` }}
                    />
                  </div>

                  {totalCost > selectedPlan.budget ? (
                    <div className="bg-orange-50 p-3 rounded-xl border border-orange-200 text-xs text-orange-800 flex items-start space-x-2 mt-0.5 animate-bounce">
                      <ShieldAlert className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Over Budget Notice:</strong> You are exceeding your planned limit by <strong>${(totalCost - selectedPlan.budget).toLocaleString()}</strong>! Review activities inside.
                      </span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-400 font-medium pl-1">
                      You are using <strong>{budgetProgress}%</strong> of your set vacation budget. Nice spending ratio!
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Adjust limit</label>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="250"
                    value={selectedPlan.budget}
                    onChange={(e) => {
                      onUpdatePlan({ ...selectedPlan, budget: Number(e.target.value) });
                    }}
                    className="w-full accent-[#00AA6C]"
                  />
                </div>
              </div>

              {/* Saved list items tips panel / quick-selection */}
              <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-3.5">
                <h3 className="text-xs font-bold text-black uppercase tracking-wider">
                  Quick City Favorites ({favorites.length})
                </h3>
                {favorites.length > 0 ? (
                  <div className="space-y-2">
                    {LISTINGS.filter((l) => favorites.includes(l.id) && l.cityId === selectedPlan.cityId).map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-all border border-gray-100"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <img
                            src={f.image}
                            alt={f.name}
                            className="w-8 h-8 rounded-md object-cover"
                          />
                          <p className="text-xs font-bold text-gray-800 truncate">{f.name}</p>
                        </div>
                        <button
                          onClick={() => {
                            // Automatically place on the current day's morning slot
                            addActivityToPlan(f, activeDayIdx, 'morning');
                          }}
                          className="bg-emerald-50 hover:bg-[#00AA6C] text-emerald-800 hover:text-white p-1 rounded-lg text-[10px] font-bold transition-all"
                          title="Schedule on Current Day"
                        >
                          + Schedule
                        </button>
                      </div>
                    ))}
                    {LISTINGS.filter((l) => favorites.includes(l.id) && l.cityId === selectedPlan.cityId).length === 0 && (
                      <p className="text-xs text-gray-400">No favorites for {selectedPlan.destinationName} yet. Save some by clicking the hearts on listing cards!</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    No items favorited yet. Click the heart icons on Hotels, Restaurants, and Attractions to list them here for quick itinerary assembly!
                  </p>
                )}
              </div>

            </div>

            {/* Right planning workspace: 8 columns */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Day horizontal selector bar */}
              <div className="flex items-center overflow-x-auto pb-2 border-b border-gray-100 gap-1.5 no-scrollbar">
                {Array.from({ length: planDaysCount }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveDayIdx(idx);
                      setShowItemSelector(null);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                      activeDayIdx === idx
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    Day {idx + 1}
                  </button>
                ))}
              </div>

              {/* Three Time Slots timeline panel */}
              <div className="space-y-6">
                {(['morning', 'afternoon', 'evening'] as const).map((slot) => {
                  const itemsInSlot = currentDayItems.filter((i) => i.timeSlot === slot);
                  const slotStyles = {
                    morning: { label: 'Morning slot', timeText: '9:00 AM - 12:00 PM', bg: 'border-l-4 border-l-amber-400 bg-amber-50/10' },
                    afternoon: { label: 'Afternoon slot', timeText: '12:00 PM - 5:00 PM', bg: 'border-l-4 border-l-sky-400 bg-sky-50/10' },
                    evening: { label: 'Evening slot', timeText: '5:00 PM - 10:00 PM', bg: 'border-l-4 border-l-purple-400 bg-purple-50/10' }
                  };
                  const cfg = slotStyles[slot];

                  return (
                    <div
                      key={slot}
                      className={`p-5 rounded-2xl border border-gray-150/70 ${cfg.bg} space-y-4`}
                    >
                      {/* Slot meta header */}
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100/60">
                        <div>
                          <h4 className="text-xs font-extrabold text-black uppercase tracking-wider">{cfg.label}</h4>
                          <span className="text-[10px] text-gray-400 mt-0.5 inline-block">{cfg.timeText}</span>
                        </div>
                        
                        <button
                          onClick={() => {
                            if (showItemSelector?.day === activeDayIdx && showItemSelector?.slot === slot) {
                              setShowItemSelector(null);
                            } else {
                              setShowItemSelector({ day: activeDayIdx, slot });
                            }
                          }}
                          className="flex items-center space-x-1 pl-2.5 pr-3 py-1.5 bg-white border border-gray-200 hover:border-black rounded-lg text-[10px] font-bold text-gray-700 transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3 text-[#00aa6c]" />
                          <span>Add activity</span>
                        </button>
                      </div>

                      {/* Dropdown item insertion selector block */}
                      {showItemSelector?.day === activeDayIdx && showItemSelector?.slot === slot && (
                        <div className="bg-white border border-gray-150 p-4 rounded-xl shadow-md animate-in slide-in-from-top-2 duration-200 space-y-3">
                          <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                              Insert into {slot} schedule
                            </span>
                            <button
                              onClick={() => setShowItemSelector(null)}
                              className="text-xs text-gray-500 font-extrabold hover:text-black cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                            {availableListingsForSelector.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => addActivityToPlan(item, activeDayIdx, slot)}
                                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg text-left transition-colors border border-gray-100"
                              >
                                <img src={item.image} alt={item.name} className="w-8 h-8 rounded-md object-cover" />
                                <div className="flex-1 truncate">
                                  <p className="text-xs font-bold text-gray-900 truncate leading-tight">{item.name}</p>
                                  <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-none mt-0.5">${item.price}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* List scheduled items in slot */}
                      <div className="space-y-3.5">
                        {itemsInSlot.length > 0 ? (
                          itemsInSlot.map((item) => (
                            <div
                              key={item.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-white border border-gray-100 rounded-xl shadow-xs hover:border-gray-300 transition-colors"
                            >
                              <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                                  />
                                )}
                                <div className="min-w-0">
                                  <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                    {item.category}
                                  </span>
                                  <h5 className="text-xs sm:text-sm font-bold text-gray-900 mt-1 truncate leading-tight">
                                    {item.title}
                                  </h5>
                                  <p className="text-[10px] text-gray-400 font-semibold leading-none mt-1">
                                    Est. Cost: ${item.price}
                                  </p>
                                </div>
                              </div>

                              {/* Interactive note-taking input and delete row */}
                              <div className="flex items-center space-x-3 w-full sm:w-auto">
                                <div className="flex items-center space-x-1.5 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 flex-1 sm:flex-initial">
                                  <PenTool className="w-3.5 h-3.5 text-gray-400" />
                                  <input
                                    type="text"
                                    value={item.notes || ''}
                                    onChange={(e) => updateItemNotes(item.id, e.target.value)}
                                    placeholder="Add reminders (e.g. Bring tickets!)..."
                                    className="text-xs text-gray-700 bg-transparent outline-hidden w-full sm:w-48 placeholder-gray-400"
                                  />
                                </div>

                                <button
                                  onClick={() => removeActivityFromPlan(item.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-gray-400 text-xs border border-dashed border-gray-200/60 rounded-xl bg-white/40">
                            No arrangements made for this slot
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}
