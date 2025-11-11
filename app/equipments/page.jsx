"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Package, Search } from "lucide-react";
import EquipmentCard from "@/components/equipments/EquipmentCard";
import { calcDistance } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/apiConfig";

export default function EquipmentsPage() {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 100000]);

  const searchParams = useSearchParams();
  const lat = parseFloat(searchParams.get("lat"));
  const lng = parseFloat(searchParams.get("lng"));
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // 🗓️ Rental days
  const days =
    from && to
      ? Math.max(1, Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)))
      : 1;

  // 🚚 Travel cost calculator
  const getTravelCost = (vendorLat, vendorLng) => {
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return 0;
    if (!vendorLat || !vendorLng || isNaN(vendorLat) || isNaN(vendorLng)) return 0;
    const distance = calcDistance(vendorLat, vendorLng, lat, lng);
    const rate = 150; // ₹ per km
    const baseCharge = 2000;
    return Math.round(baseCharge + distance * rate);
  };

  // 🧠 Fetch equipments
  useEffect(() => {
    (async function fetchEquipments() {
      try {
        setLoading(true);
        const equipmentQuery = searchParams.get("equipment")?.trim();
        let url = equipmentQuery
          ? `${API_BASE_URL}/api/equipments/search?q=${encodeURIComponent(
              equipmentQuery
            )}`
          : `${API_BASE_URL}/api/equipments`;

        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch equipments");

        const data = await res.json();
        const list = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data)
          ? data
          : [];

        setEquipments(list);
      } catch (err) {
        console.error("❌ Error fetching equipments:", err);
        setEquipments([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams]);

  // 🔍 Filtering & sorting
  const filteredEquipments = equipments
    .filter((eq) => {
      const nameMatch = eq.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const typeMatch = filterType ? eq.type === filterType : true;
      const priceMatch =
        parseFloat(eq.price) >= priceRange[0] && parseFloat(eq.price) <= priceRange[1];
      return nameMatch && typeMatch && priceMatch;
    })
    .sort((a, b) => {
      if (sortBy === "priceLow") return a.price - b.price;
      if (sortBy === "priceHigh") return b.price - a.price;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  // 🕐 Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading equipments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ================= HEADER ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#14213D] mb-2">
            Available Equipments
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Browse and rent heavy machinery for your next project.
          </p>
          {lat && lng && (
            <p className="text-xs sm:text-sm text-blue-700 mt-2">
              Delivery cost calculated from your selected location.
            </p>
          )}
        </motion.div>

        {/* ================= FILTER BAR ================= */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 mb-10 bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
          {/* 🔍 Search */}
          <div className="relative w-full sm:w-auto flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* 🧱 Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="Excavator">Excavator</option>
            <option value="Crane">Crane</option>
            <option value="Bulldozer">Bulldozer</option>
            <option value="Loader">Loader</option>
            <option value="Dump Truck">Dump Truck</option>
            <option value="Concrete Mixer">Concrete Mixer</option>
          </select>

          {/* 🔽 Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
          </select>
        </div>

        {/* ================= EQUIPMENTS GRID ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {filteredEquipments.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                No equipments found
              </h3>
              {searchParams.get("equipment") ? (
                <p className="text-gray-600 mt-2">
                  No results for “{searchParams.get("equipment")}”. Try a different keyword.
                </p>
              ) : (
                <p className="text-gray-600 mt-2">Try searching or adjusting filters.</p>
              )}
            </div>
          ) : (
            filteredEquipments.map((equipment) => {
              const travelCost = getTravelCost(equipment.baseLat, equipment.baseLng);
              const basePrice = parseFloat(equipment.price) || 0;
              const total = basePrice * days + travelCost;
              const finalTotal = (total + total * 0.01).toFixed(2);

              return (
                <EquipmentCard
                  key={equipment.id}
                  equipment={equipment}
                  days={days}
                  travelCost={travelCost}
                  totalAmount={finalTotal}
                  pickupDate={from}
                  dropDate={to}
                />
              );
            })
          )}
        </motion.div>
      </div>
    </div>
  );
}
