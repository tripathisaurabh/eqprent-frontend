"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { IndianRupee, TrendingUp, Sparkles, ChevronRight, AlertCircle } from "lucide-react";

export default function ProductRecommendations({ currentProductId = null }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendationType, setRecommendationType] = useState("top");
  const [debugInfo, setDebugInfo] = useState({ mounted: true, logs: [] });

  const addLog = (message, data = null) => {
    console.log(message, data || "");
    setDebugInfo(prev => ({
      ...prev,
      logs: [...prev.logs, { message, data, time: new Date().toLocaleTimeString() }]
    }));
  };

  useEffect(() => {
    addLog("🔍 ProductRecommendations Component Mounted", { currentProductId });
    fetchRecommendations();
  }, [currentProductId]);

  const fetchRecommendations = async () => {
    addLog("📡 Starting fetch recommendations...");
    setIsLoading(true);
    
    try {
      // Check if user has search history
      const searchHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");
      const hasSearched = searchHistory.length > 0;
      addLog("📜 Search History Check", { searchHistory, hasSearched });

      let url;
      let data;

      if (hasSearched) {
        setRecommendationType("personalized");
        const lastSearches = searchHistory.slice(-3);
        const searchQuery = lastSearches.join(",");
        url = `http://localhost:5001/api/equipments?search=${searchQuery}&limit=6`;
        addLog("🎯 Fetching personalized", { url, searchQuery });
      } else {
        setRecommendationType("top");
        url = `http://localhost:5001/api/equipments?limit=6`;
        addLog("🔥 Fetching top products", { url });
      }

      if (currentProductId) {
        url += `&exclude=${currentProductId}`;
      }

      addLog("🌐 Making API request", { url });
      const response = await fetch(url);
      addLog("📥 API Response received", { 
        status: response.status, 
        ok: response.ok,
        statusText: response.statusText 
      });

      data = await response.json();
      addLog("📦 API Response parsed", { 
        dataType: typeof data,
        isArray: Array.isArray(data),
        keys: Object.keys(data || {}),
        data: data
      });

      // Handle different response structures
      let equipmentList = [];
      if (Array.isArray(data)) {
        equipmentList = data;
        addLog("✅ Data is direct array", { count: equipmentList.length });
      } else if (data.equipments && Array.isArray(data.equipments)) {
        equipmentList = data.equipments;
        addLog("✅ Data found in 'equipments' key", { count: equipmentList.length });
      } else if (data.data && Array.isArray(data.data)) {
        equipmentList = data.data;
        addLog("✅ Data found in 'data' key", { count: equipmentList.length });
      } else if (data.results && Array.isArray(data.results)) {
        equipmentList = data.results;
        addLog("✅ Data found in 'results' key", { count: equipmentList.length });
      } else {
        addLog("❌ Could not find array in response", { data });
      }

      setRecommendations(equipmentList);
      addLog("✅ Recommendations set", { count: equipmentList.length });

    } catch (error) {
      addLog("❌ Error in fetch", { error: error.message, stack: error.stack });
      
      // Fallback
      try {
        addLog("🔄 Trying fallback fetch");
        const response = await fetch(`http://localhost:5001/api/equipments?limit=6`);
        const data = await response.json();
        
        let equipmentList = [];
        if (Array.isArray(data)) {
          equipmentList = data;
        } else if (data.equipments) {
          equipmentList = data.equipments;
        } else if (data.data) {
          equipmentList = data.data;
        }
        
        setRecommendations(equipmentList);
        addLog("✅ Fallback successful", { count: equipmentList.length });
      } catch (err) {
        addLog("❌ Fallback failed", { error: err.message });
        setRecommendations([]);
      }
    } finally {
      setIsLoading(false);
      addLog("✅ Fetch complete");
    }
  };

  const normalizeImageUrl = (url) =>
    !url
      ? "/placeholder.jpg"
      : url.startsWith("http")
      ? url
      : `http://localhost:5001${url}`;

  // Always show debug panel in development
  const showDebug = process.env.NODE_ENV === 'development' || true;

  if (isLoading) {
    return (
      <div className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  const productList = Array.isArray(recommendations) ? recommendations : [];

  return (
    <div className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Debug Panel */}
        {showDebug && (
          <div className="mb-8 bg-gray-900 text-white p-4 rounded-lg text-xs overflow-auto max-h-60">
            <div className="flex items-center gap-2 mb-2 font-bold">
              <AlertCircle className="w-4 h-4" />
              Debug Info (Remove in production)
            </div>
            <div className="space-y-1">
              <p>✅ Component Mounted: {debugInfo.mounted ? 'Yes' : 'No'}</p>
              <p>📊 Products Found: {productList.length}</p>
              <p>🔍 Recommendation Type: {recommendationType}</p>
              <p>📝 Recent Logs:</p>
              <div className="ml-4 space-y-1 max-h-32 overflow-auto">
                {debugInfo.logs.slice(-10).map((log, i) => (
                  <div key={i} className="text-green-400">
                    [{log.time}] {log.message}
                    {log.data && <pre className="ml-2 text-gray-400">{JSON.stringify(log.data, null, 2)}</pre>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Products Message */}
        {productList.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-gray-500 bg-gray-100 px-6 py-4 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <p>No recommendations available at the moment.</p>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              Check the debug panel above for details.
            </div>
          </div>
        ) : (
          <>
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                {recommendationType === "personalized" ? (
                  <Sparkles className="w-6 h-6 text-purple-600" />
                ) : (
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                )}
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {recommendationType === "personalized"
                    ? "Recommended For You"
                    : "Top Equipment"}
                </h2>
              </div>
              <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                {recommendationType === "personalized"
                  ? "Based on your recent searches and interests"
                  : "Most popular equipment trusted by our customers"}
              </p>
            </motion.div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {productList.map((product, index) => (
                <motion.div
                  key={product._id || product.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/equipments/${product._id || product.id}`}>
                    <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-2">
                      {/* Product Image */}
                      <div className="relative h-56 overflow-hidden bg-gray-100">
                        <img
                          src={normalizeImageUrl(product.images?.[0] || product.image)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => (e.target.src = "/placeholder.jpg")}
                        />
                        
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          {product.type}
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <span className="text-white font-semibold flex items-center gap-1 text-sm">
                            View Details <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {product.description || "High-quality equipment for your project needs"}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-baseline gap-1">
                            <IndianRupee className="w-5 h-5 text-gray-700" />
                            <span className="text-2xl font-bold text-gray-900">
                              {product.price}
                            </span>
                            <span className="text-sm text-gray-500">/day</span>
                          </div>
                          <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                            Available
                          </div>
                        </div>

                        {product.vendor && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500">
                              by{" "}
                              <span className="font-semibold text-gray-700">
                                {product.vendor.companyName || product.vendor.name}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* View All Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-center mt-12"
            >
              <Link
                href="/equipments"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                View All Equipment
                <ChevronRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}