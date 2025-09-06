import React, { useState } from "react";
import SellerOrderHistory from "./SellerOrderHistory";
import CustomerOrders from "./CustomerOrders";

export default function CustomerOrderHistory() {
  const [activeTab, setActiveTab] = useState("sold");

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
        ${
          active
            ? "bg-indigo-600 text-white border-indigo-600 shadow-md focus:ring-indigo-500"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-indigo-300"
        }`}
    >
      {label}
    </button>
  );
}
