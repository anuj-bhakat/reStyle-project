import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ManagerNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("managerToken");
        navigate("/manager-login", { replace: true });
    };

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-2 rounded-lg shadow-sm">
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        Manager Dashboard
                    </h1>
                    {localStorage.getItem('isGuest') === 'true' && (
                        <span className="ml-3 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full border border-yellow-200 shadow-sm animate-pulse">
                            Guest Mode
                        </span>
                    )}
                </div>

                <nav className="hidden md:flex items-center gap-1 bg-gray-50/50 p-1.5 rounded-full border border-gray-100">
                    <button
                        onClick={() => navigate("/manager-dashboard")}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive("/manager-dashboard")
                            ? "bg-white text-indigo-600 shadow-sm border border-gray-100"
                            : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                            }`}
                    >
                        Pending Requests
                    </button>
                    <button
                        onClick={() => navigate("/warehouse-reviews")}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive("/warehouse-reviews")
                            ? "bg-white text-indigo-600 shadow-sm border border-gray-100"
                            : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                            }`}
                    >
                        Warehouse Requests
                    </button>
                    <button
                        onClick={() => navigate("/manager-redesign-review")}
                        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive("/manager-redesign-review")
                            ? "bg-white text-indigo-600 shadow-sm border border-gray-100"
                            : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                            }`}
                    >
                        Redesign Review
                    </button>
                </nav>

                <button
                    onClick={handleLogout}
                    className="group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                    <span>Logout</span>
                    <svg
                        className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default ManagerNavbar;
