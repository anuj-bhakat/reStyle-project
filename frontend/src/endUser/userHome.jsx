import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, ShoppingBagIcon, TagIcon } from '@heroicons/react/24/outline';
import BuyProduct from './BuyProduct';
import SellProduct from './SellProduct';
import Profile from './Profile';
import CustomerOrderHistory from './CustomerOrderHistory';

const UserHome = () => {
  const navigate = useNavigate();
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isBuyActive, setIsBuyActive] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Security: check on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
    }
    updateCartCount();
  }, [navigate]);

  // Update cart count whenever the component mounts or cart changes
  const updateCartCount = () => {
    const cartData = sessionStorage.getItem('cart');
    if (cartData) {
      try {
        const parsed = JSON.parse(cartData);
        setCartCount(parsed.length);
      } catch (err) {
        console.error('Error reading cart from sessionStorage:', err);
        sessionStorage.removeItem('cart');
        setCartCount(0);
      }
    } else {
      setCartCount(0);
    }
  };

  const toggleDashboard = () => setIsDashboardOpen(!isDashboardOpen);

  const handleBuyClick = () => {
    setIsBuyActive(true);
    setShowProfile(false);
    setShowOrderHistory(false);
  };

  const handleSellClick = () => {
    setIsBuyActive(false);
    setShowProfile(false);
    setShowOrderHistory(false);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      localStorage.removeItem('token');
      localStorage.removeItem('userid');
      navigate('/');
    }
  };

  const handleHistoryClick = () => {
    setShowOrderHistory(true);
    setShowProfile(false);
    setIsDashboardOpen(false);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Brand Name */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 font-['Montserrat']">reStyle</h1>
            </div>

            {/* Buy/Sell Buttons & Cart Icon */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBuyClick}
                className={`px-6 py-2 font-semibold rounded-full shadow-md transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  isBuyActive
                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500'
                }`}
              >
                <ShoppingBagIcon className="w-5 h-5 inline mr-2" />
                Buy
              </button>
              <button
                onClick={handleSellClick}
                className={`px-6 py-2 font-semibold rounded-full shadow-md transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  !isBuyActive
                    ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500'
                }`}
              >
                <TagIcon className="w-5 h-5 inline mr-2" />
                Sell
              </button>

              {/* Cart Icon with Count */}
              <button
                onClick={handleCartClick}
                className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                title="View Cart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m4-9l2 9" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User Dashboard Icon */}
              <button
                onClick={toggleDashboard}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                <UserIcon className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Right-Side Dashboard Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isDashboardOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">User Dashboard</h2>
            <button
              onClick={toggleDashboard}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Dashboard Content */}
          <div className="space-y-4">
            <button
              onClick={() => { setShowProfile(true); setIsDashboardOpen(false); }}
              className="w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <h3 className="font-semibold text-gray-900">Profile</h3>
              <p className="text-sm text-gray-600">Manage your account details</p>
            </button>

            <button
              onClick={handleHistoryClick}
              className="w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <h3 className="font-semibold text-gray-900">History</h3>
              <p className="text-sm text-gray-600">View your order history</p>
            </button>

            <button
              onClick={handleLogout}
              className="w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <h3 className="font-semibold text-gray-900">Logout</h3>
              <p className="text-sm text-gray-600">Sign out of your account</p>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with Conditional Rendering */}
      <main className="pt-16">
        {showProfile ? (
          <Profile />
        ) : showOrderHistory ? (
          <CustomerOrderHistory />
        ) : (
          <>
            <div className={`transition-opacity duration-500 ${isBuyActive ? 'opacity-100' : 'opacity-0'} ${isBuyActive ? 'block' : 'hidden'}`}>
              {isBuyActive && <BuyProduct />}
            </div>
            <div className={`transition-opacity duration-500 ${!isBuyActive ? 'opacity-100' : 'opacity-0'} ${!isBuyActive ? 'block' : 'hidden'}`}>
              {!isBuyActive && <SellProduct />}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm">&copy; 2024 reStyle. All rights reserved.</p>
            <div className="mt-4 flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserHome;
