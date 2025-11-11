"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LocationPicker from "./LocationPicker";
import { MapPin, Search } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  const [sticky, setSticky] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [form, setForm] = useState({
    equipment: "",
    from: "",
    to: "",
    address: "",
    lat: "",
    lng: "",
  });

  // 🧭 Detect device size + sticky behavior
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleScroll = () => {
      if (!isMobile) setSticky(window.scrollY > 250);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobile]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLocationSelect = (pos) =>
    setForm({
      ...form,
      address: pos.address || "",
      lat: pos.lat || "",
      lng: pos.lng || "",
    });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!form.from || !form.to) return alert("Please select pickup and drop dates.");
    if (!form.lat || !form.lng) return alert("Please select a delivery location.");

    // Save to localStorage
    try {
      const searchHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]");
      const term = form.equipment.trim().toLowerCase();
      if (term && searchHistory[searchHistory.length - 1] !== term) searchHistory.push(term);
      if (searchHistory.length > 10) searchHistory.shift();
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    } catch {}

    // Send to backend
    try {
      const userId = localStorage.getItem("userId");
      await fetch("http://localhost:5001/api/search-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId ? Number(userId) : null,
          ...form,
        }),
      });
    } catch (err) {
      console.warn("Failed to log search:", err.message);
    }

    // Redirect
    const query = new URLSearchParams(form).toString();
    router.push(`/equipments?${query}`);
  };

  return (
    <div
      className={`transition-all duration-300 ${
        !isMobile && sticky
          ? "fixed top-[80px] sm:top-[100px] left-1/2 -translate-x-1/2 z-50 w-[96%] sm:w-[94%] md:w-[85%] lg:w-[80%] shadow-2xl"
          : "relative w-full"
      } ${isMobile ? "mt-4" : ""}`}
    >
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-3 sm:p-4 space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:items-end sm:gap-3"
      >
        {/* Equipment Type */}
        <div className="flex flex-col sm:flex-1 sm:min-w-[180px]">
          <label className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
            Equipment Type
          </label>
          <input
            name="equipment"
            type="text"
            placeholder="e.g. Crane, Excavator"
            value={form.equipment}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base text-gray-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
          />
        </div>

        {/* Pickup Date */}
        <div className="flex flex-col sm:flex-1 sm:min-w-[180px]">
          <label className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
            Pickup Date & Time
          </label>
          <input
            name="from"
            type="datetime-local"
            value={form.from}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base text-gray-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
            required
          />
        </div>

        {/* Drop Date */}
        <div className="flex flex-col sm:flex-1 sm:min-w-[180px]">
          <label className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
            Drop Date & Time
          </label>
          <input
            name="to"
            type="datetime-local"
            value={form.to}
            onChange={handleChange}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base text-gray-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
            required
          />
        </div>

        {/* Location */}
        <div className="flex flex-col sm:flex-1 sm:min-w-[200px]">
          <label className="text-xs sm:text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            Delivery Location
          </label>
          <LocationPicker onSelect={handleLocationSelect} />
          {form.address && (
            <p className="text-xs text-gray-500 mt-1 truncate">{form.address}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-md transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Search</span>
        </button>
      </form>
    </div>
  );
}
