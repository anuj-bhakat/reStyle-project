import React, { useState } from "react";
import SellerOrderHistory from "./SellerOrderHistory";
import CustomerOrders from "./CustomerOrders";

export default function CustomerOrderHistory() {
  const [activeTab, setActiveTab] = useState("sold"); // 'sold' or 'bought'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-white shadow-md px-6 py-4">
        {/* Left: Order History text */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 select-none">
            Order History
          </h1>
        </div>
        {/* Center: Toggle buttons */}
        <div className="flex-1 flex justify-center space-x-3">
          <ToggleButton
            id="sold"
            active={activeTab === "sold"}
            onClick={() => setActiveTab("sold")}
            label="Sold"
          />
          <ToggleButton
            id="bought"
            active={activeTab === "bought"}
            onClick={() => setActiveTab("bought")}
            label="Bought"
          />
        </div>
        {/* Right: Spacer */}
        <div className="flex-1" />
      </nav>

      {/* Content Area */}
      <main className="flex-grow p-6">
        {activeTab === "sold" && <SellerOrderHistory />}
        {activeTab === "bought" && <CustomerOrders />}
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
      className={`px-5 py-2 rounded-full font-semibold text-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        active
          ? "bg-indigo-600 text-white shadow-md"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
      aria-label={`${label} orders tab`}
    >
      {label}
    </button>
  );
}
