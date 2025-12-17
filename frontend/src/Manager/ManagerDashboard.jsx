import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ManagerNavbar from "./ManagerNavbar";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem("managerToken");
    if (!token) {
      navigate("/manager-login", { replace: true });
      return;
    }
    fetchPendingRequests();
  }, [navigate]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/products/get/draft`);
      setPendingRequests(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch pending requests");
      console.error("Error fetching pending requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const handleReviewProduct = (listingId) => {
    navigate("/manager-review", { state: { listingId } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">Loading pending requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow rounded-lg px-8 py-6 text-center">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={fetchPendingRequests}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ManagerNavbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Pending Sell Requests</h2>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <div className="text-5xl mb-2 text-gray-300">📦</div>
            <h3 className="text-base font-medium text-gray-800 mb-1">No pending requests</h3>
            <p className="text-sm text-gray-500">All sell requests have been processed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {pendingRequests.map((request) => (
              <div
                key={request.listing_id}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col overflow-hidden"
              >
                {/* Image Section */}
                <div
                  className="relative aspect-[4/3] bg-gray-50 flex justify-center items-center overflow-hidden cursor-pointer group-hover:opacity-95 transition-opacity"
                  onClick={() => handleReviewProduct(request.listing_id)}
                >
                  {request.product_images?.[0]?.url ? (
                    <img
                      src={request.product_images[0].url}
                      alt={request.product_type}
                      className="object-contain w-full h-full p-4 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <svg className="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-medium">No Image</span>
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase tracking-wide rounded-full shadow-sm border border-yellow-200">
                      {request.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-3">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 leading-tight line-clamp-1 capitalize" title={`${request.brand} ${request.product_type}`}>
                        {request.brand} {request.product_type}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] uppercase font-semibold tracking-wider rounded">
                        {request.condition.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                    {request.description}
                  </p>



                  <div className="mt-auto pt-4 border-t border-gray-50">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <span>Requested on</span>
                      <span className="font-medium text-gray-600">{new Date(request.created_at).toLocaleDateString()}</span>
                    </div>

                    <button
                      onClick={() => handleReviewProduct(request.listing_id)}
                      className="w-full group/btn relative flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                    >
                      <span>Review Details</span>
                      <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ManagerDashboard;
