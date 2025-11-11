"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Package, MapPin, CheckCircle, XCircle } from "lucide-react";
import { API_BASE_URL } from "@/lib/apiConfig";

export default function VendorBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vendorId, setVendorId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("userId");
      if (id) setVendorId(Number(id));
    }
  }, []);

  useEffect(() => {
    if (!vendorId) return;
    fetchBookings();
    const interval = setInterval(fetchBookings, 30000);
    return () => clearInterval(interval);
  }, [vendorId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/bookings/vendor/${vendorId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const items = Array.isArray(data.items)
        ? data.items
        : Array.isArray(data.bookings)
          ? data.bookings
          : [];

      setBookings(items);
      setError("");
    } catch (err) {
      console.error("❌ Error fetching vendor bookings:", err);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };


  const updateBookingStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) await fetchBookings();
    } catch (err) {
      console.error("❌ Error updating booking:", err);
    }
  };

  const filteredBookings = filterStatus === "ALL" ? bookings : bookings.filter((b) => (b.status || "").toUpperCase() === filterStatus);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading bookings...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-lg">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-10 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header + Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Customer Bookings</h1>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white p-10 rounded-lg shadow text-center">
            <Package className="h-10 w-10 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {filteredBookings.map((b) => (
                <motion.div
                  key={b.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 flex flex-col md:flex-row justify-between"
                >
                  {/* Left Info */}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900">{b.equipment?.name || "Equipment"}</h2>

                    {/* ✅ Equipment ID */}
                    {b.equipment?.id && (
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="font-semibold">Equipment ID:</span> {b.equipment.id}
                      </p>
                    )}
                    {/* <p className="text-sm text-gray-500 mt-1">
                    Location: {b.address || "Not set"}
                  </p> */}

                    <p className="text-gray-600 text-sm">Booking ID: <span className="font-medium">{b.referenceId}</span></p>
                    <p className="text-gray-600 text-sm mt-1">Customer: <span className="font-medium">{b.user?.name || b.name || "Unknown"}</span></p>

                    <div className="flex items-center text-sm text-gray-600 mt-3 gap-3">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(b.pickupDate).toLocaleDateString()} → {new Date(b.dropDate).toLocaleDateString()}</span>
                    </div>

                    {/* ✅ Address + Map */}
                    {b.address && (
                      <div className="mt-3">
                        <div className="flex items-center text-sm text-gray-600 gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="break-words max-w-xs md:max-w-md">{b.address}</span>
                        </div>


                      </div>
                    )}

                    <p className="text-blue-600 font-semibold mt-3">₹{Number(b.totalAmount).toFixed(2)} ({(b.paymentType || "COD").toUpperCase()})</p>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col items-end justify-between mt-4 md:mt-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${b.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : b.status === "CONFIRMED"
                            ? "bg-green-100 text-green-700"
                            : b.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-700"
                              : b.status === "CANCELLED"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {b.status}
                    </span>

                    <div className="flex gap-2 mt-3 flex-wrap">
                      {b.status === "PENDING" && (
                        <>
                          <button onClick={() => updateBookingStatus(b.id, "CONFIRMED")} className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
                            <CheckCircle className="h-4 w-4" /> Accept
                          </button>
                          <button onClick={() => updateBookingStatus(b.id, "CANCELLED")} className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">
                            <XCircle className="h-4 w-4" /> Reject
                          </button>
                        </>
                      )}
                      {b.status === "CONFIRMED" && (
                        <button onClick={() => updateBookingStatus(b.id, "COMPLETED")} className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                          <CheckCircle className="h-4 w-4" /> Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
