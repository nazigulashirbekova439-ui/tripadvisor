import React, { useState } from 'react';
import { Menu, X, Globe, Heart, Bell, User, LogIn, Compass, History } from 'lucide-react';

interface NavbarProps {
  currentUser: { name: string; avatar: string; location: string } | null;
  onLogin: (user: { name: string; avatar: string; location: string } | null) => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
  onOpenMyTrips: () => void;
}

export default function Navbar({
  currentUser,
  onLogin,
  activeSection,
  setActiveSection,
  onOpenMyTrips
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [locInput, setLocInput] = useState('San Francisco, CA');

  const handleMockLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    onLogin({
      name: nameInput,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      location: locInput
    });
    setNameInput('');
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    onLogin(null);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div 
              className="flex items-center space-x-3 cursor-pointer shrink-0" 
              onClick={() => setActiveSection('home')}
            >
              {/* Official Tripadvisor brand SVG owl face replica */}
              <svg className="w-10 h-10 text-black" viewBox="0 0 200 200" fill="currentColor">
                <circle cx="63" cy="115" r="32" fill="#00AA6C" />
                <circle cx="137" cy="115" r="32" fill="#00AA6C" />
                <path d="M100,50 C115,50 145,55 160,75 C164,79 164,84 158,84 C132,84 118,66 100,66 C82,66 68,84 42,84 C36,84 36,79 40,75 C55,55 85,50 100,50 Z" />
                <circle cx="63" cy="115" r="23" fill="#FFFFFF" />
                <circle cx="137" cy="115" r="23" fill="#FFFFFF" />
                <circle cx="63" cy="115" r="10" fill="#000000" />
                <circle cx="137" cy="115" r="10" fill="#000000" />
                <circle cx="58" cy="110" r="3" fill="#FFFFFF" />
                <circle cx="132" cy="110" r="3" fill="#FFFFFF" />
                <path d="M100,105 L90,135 L110,135 Z" fill="#000000" />
              </svg>
              <span className="text-2xl font-extrabold tracking-tight text-black hidden sm:inline">
                tripadvisor
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-4">
              <button
                onClick={() => setActiveSection('home')}
                className={`px-3 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                  activeSection === 'home' ? 'bg-gray-100 text-black' : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                }`}
              >
                Discover
              </button>
              <button
                onClick={onOpenMyTrips}
                className={`px-3 py-2 text-sm font-semibold rounded-full transition-all duration-300 flex items-center space-x-1 ${
                  activeSection === 'trips' ? 'bg-gray-100 text-black' : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                }`}
              >
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>Trips</span>
              </button>
              <button
                onClick={() => setActiveSection('review')}
                className={`px-3 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                  activeSection === 'review' ? 'bg-gray-100 text-black' : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                }`}
              >
                Review
              </button>
              <span className="h-5 w-px bg-gray-200 mx-2" />
              <button className="p-2 text-gray-500 hover:text-black rounded-full hover:bg-gray-100 transition-colors">
                <Globe className="w-5 h-5" />
              </button>
              <button 
                onClick={onOpenMyTrips}
                className="p-2 text-gray-500 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors relative"
              >
                <Heart className="w-5 h-5" />
              </button>

              {currentUser ? (
                <div className="flex items-center space-x-3 pl-2">
                  <div className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 rounded-full py-1.5 pr-4 pl-1.5 border border-gray-200 cursor-pointer transition-colors">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500"
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold leading-tight text-gray-800">{currentUser.name}</p>
                      <p className="text-[10px] text-gray-500 leading-none">{currentUser.location}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-black text-white hover:bg-gray-800 px-5 py-2.5 rounded-full text-sm font-bold shadow-xs hover:shadow-md transition-all duration-300"
                >
                  Sign In
                </button>
              )}
            </nav>

            {/* Mobile Actions */}
            <div className="flex items-center md:hidden space-x-3">
              <button
                onClick={onOpenMyTrips}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors relative"
              >
                <Heart className="w-5 h-5" />
              </button>
              {currentUser ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500 cursor-pointer"
                  onClick={() => setActiveSection('trips')}
                />
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-2 shadow-inner">
            <button
              onClick={() => {
                setActiveSection('home');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-base font-bold transition-all ${
                activeSection === 'home' ? 'bg-emerald-50 text-emerald-800' : 'text-gray-800 hover:bg-gray-50'
              }`}
            >
              Discover Home
            </button>
            <button
              onClick={() => {
                onOpenMyTrips();
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-base font-bold transition-all flex items-center space-x-2 ${
                activeSection === 'trips' ? 'bg-emerald-50 text-emerald-800' : 'text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Compass className="w-5 h-5 text-emerald-600" />
              <span>My Custom Trips</span>
            </button>
            <button
              onClick={() => {
                setActiveSection('review');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-base font-bold transition-all ${
                activeSection === 'review' ? 'bg-emerald-50 text-emerald-800' : 'text-gray-800 hover:bg-gray-50'
              }`}
            >
              Write a Review
            </button>

            {currentUser ? (
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-xl mb-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{currentUser.name}</h4>
                    <p className="text-xs text-gray-500">{currentUser.location}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowAuthModal(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center bg-black text-white hover:bg-gray-800 py-3 rounded-xl font-bold mt-2 shadow-xs"
              >
                Sign In / Register
              </button>
            )}
          </div>
        )}
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in duration-300">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="px-6 py-8">
              <div className="flex flex-col items-center mb-6">
                <svg className="w-14 h-14 text-emerald-600 mb-2" viewBox="0 0 200 200" fill="currentColor">
                  <circle cx="63" cy="115" r="32" fill="#00AA6C" />
                  <circle cx="137" cy="115" r="32" fill="#00AA6C" />
                  <path d="M100,50 C115,50 145,55 160,75 C164,79 164,84 158,84 C132,84 118,66 100,66 C82,66 68,84 42,84 C36,84 36,79 40,75 C55,55 85,50 100,50 Z" />
                  <circle cx="63" cy="115" r="23" fill="#FFFFFF" />
                  <circle cx="137" cy="115" r="23" fill="#FFFFFF" />
                  <circle cx="63" cy="115" r="10" fill="#000000" />
                  <circle cx="137" cy="115" r="10" fill="#000000" />
                  <circle cx="58" cy="110" r="3" fill="#FFFFFF" />
                  <circle cx="132" cy="110" r="3" fill="#FFFFFF" />
                  <path d="M100,105 L90,135 L110,135 Z" fill="#000000" />
                </svg>
                <h3 className="text-xl font-extrabold text-black tracking-tight">Sign In to Tripadvisor</h3>
                <p className="text-xs text-gray-500 mt-1">Unlock live reviews and personal trip planning</p>
              </div>

              <form onSubmit={handleMockLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Amanda Cole"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Location / Country
                  </label>
                  <input
                    type="text"
                    value={locInput}
                    onChange={(e) => setLocInput(e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm outline-hidden transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#00AA6C] hover:bg-[#008f5d] text-white py-3.5 rounded-full text-sm font-extrabold shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-100 transition-all duration-300"
                  >
                    Enter Workspace Sandbox
                  </button>
                </div>
              </form>

              <div className="mt-4 text-center">
                <p className="text-[10px] text-gray-400">
                  By clicking enter, you agree to our mocked sandbox guidelines. Your local changes persist in memory.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
