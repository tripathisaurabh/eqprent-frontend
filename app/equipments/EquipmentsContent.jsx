"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Package } from "lucide-react";
import EquipmentCard from "@/components/equipments/EquipmentCard";
import { calcDistance } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/apiConfig";

export default function EquipmentsContent() {
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

  const days =
    from && to
      ? Math.max(1, Math.ceil((new Date(to) - new Date(from)) / 86400000))
      : 1;

  const getTravelCost = (vendorLat, vendorLng) => {
    if (!lat || !lng || !vendorLat || !vendorLng) return 0;
    const distance = calcDistance(vendorLat, vendorLng, lat, lng);
    return Math.round(2000 + distance * 150);
  };

  useEffect(() => {
    (async function fetchEquipments() {
      try {
        setLoading(true);

        const res = await fetch(`${API_BASE_URL}/api/equipments/all`);
        const data = await res.json();

        console.log("🟢 Marketplace API:", data);

        const list = Array.isArray(data.items) ? data.items : [];

        setEquipments(list);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setEquipments([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🔍 FIXED SEARCH + FILTER
  const filteredEquipments = equipments
    .filter((eq) => {
      const q = searchTerm.toLowerCase().trim();

      const matches =
        eq.name?.toLowerCase().includes(q) ||
        eq.type?.toLowerCase().includes(q) ||
        eq.brand?.toLowerCase().includes(q) ||
        eq.model?.toLowerCase().includes(q) ||
        eq.description?.toLowerCase().includes(q);

      const typeMatch = filterType ? eq.type === filterType : true;

      const priceMatch =
        parseFloat(eq.price) >= priceRange[0] &&
        parseFloat(eq.price) <= priceRange[1];

      return matches && typeMatch && priceMatch;
    })
    .sort((a, b) => {
      if (sortBy === "priceLow") return a.price - b.price;
      if (sortBy === "priceHigh") return b.price - a.price;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading equipments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#14213D]">
            Available Equipments
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Browse and rent heavy machinery for your project.
          </p>
        </motion.div>

        {/* ============== GRID ============== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredEquipments.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                No equipments found
              </h3>
              <p className="text-gray-600">Try a different keyword.</p>
            </div>
          ) : (
            filteredEquipments.map((eq) => {
              const travel = getTravelCost(eq.baseLat, eq.baseLng);
              const basePrice = parseFloat(eq.price) || 0;
              const total = (basePrice * days + travel) * 1.01;

              return (
                <EquipmentCard
                  key={eq.id}
                  equipment={eq}
                  days={days}
                  travelCost={travel}
                  totalAmount={total.toFixed(2)}
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
