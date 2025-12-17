import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SellerOrderHistory from "./SellerOrderHistory";
import CustomerOrders from "./CustomerOrders";

export default function CustomerOrderHistory() {
  const [activeTab, setActiveTab] = useState("sold");
  const navigate = useNavigate();

  const isGuest = localStorage.getItem('isGuest') === 'true';

  if (isGuest) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden text-center p-12">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order History Unavailable</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Guest accounts don't have an order history. Create an account to track your purchases and sales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
              >
                Create Account
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
            Order History
          </h1>

          {/* Toggle Buttons */}
          <div className="flex space-x-2 sm:space-x-4">
            <ToggleButton
              id="sold"
              label="Sold"
              active={activeTab === "sold"}
              onClick={() => setActiveTab("sold")}
            />
            <ToggleButton
              id="bought"
              label="Bought"
              active={activeTab === "bought"}
              onClick={() => setActiveTab("bought")}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-10">
        <div className="bg-white shadow-sm rounded-xl p-6">
          {activeTab === "sold" && <SellerOrderHistory />}
          {activeTab === "bought" && <CustomerOrders />}
        </div>
      </main>
    </div>
  );
}

function ToggleButton({ active, onClick, label, id }) {
  return (
    <button
      id={id}
      role="tab"
      aria-selected={active}
      onClick={onClick}
      aria-label={`${label} orders tab`}
      className={`px-5 py-2.5 rounded-lg font-medium text-sm sm:text-base border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 
        ${active
          ? "bg-indigo-600 text-white border-indigo-600 shadow-md focus:ring-indigo-500"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-indigo-300"
        }`}
    >
      {label}
    </button>
  );
}
