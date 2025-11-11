"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, CreditCard } from "lucide-react";
import { DateRange } from "react-date-range";
import { addDays } from "date-fns";
import Link from "next/link";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import ManageBookingModal from "@/components/ManageBookingModal";
import TransactionsTab from "@/components/TransactionsTab";
import { API_BASE_URL } from "@/lib/apiConfig";

/* =====================================================
   🧭 USER DASHBOARD PAGE
   ===================================================== */
export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("current");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("userName");
    if (!token || role !== "USER") {
      window.location.href = "/login";
      return;
    }
    setUser({ name, role });
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await fetch(`${API_BASE_URL}/api/bookings/user/${userId}`);
      const data = await res.json();
      if (res.ok && data.success) setBookings(data.items || []);
    } catch (err) {
      console.error("❌ Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/user/cancel/${id}`, {
        method: "PUT",
      });
      const data = await res.json();
      if (data.success) fetchBookings();
    } catch (err) {
      console.error("❌ Cancel booking failed:", err);
    }
  };

  const filteredBookings = useMemo(() => {
    if (!Array.isArray(bookings)) return [];
    const now = new Date();
    const nonCancelled = (b) => (b?.status || "").toUpperCase() !== "CANCELLED";
    const current = bookings.filter(
      (b) =>
        new Date(b.pickupDate) <= now &&
        new Date(b.dropDate) >= now &&
        nonCancelled(b)
    );
    const upcoming = bookings.filter(
      (b) => new Date(b.pickupDate) > now && nonCancelled(b)
    );
    const history = bookings.filter(
      (b) =>
        new Date(b.dropDate) < now ||
        ["COMPLETED", "CANCELLED"].includes((b?.status || "").toUpperCase())
    );

    const all = [...bookings].sort(
      (a, b) => new Date(b.pickupDate) - new Date(a.pickupDate)
    );

    let baseList = [];
    if (activeTab === "all") baseList = all;
    else if (activeTab === "current") baseList = current;
    else if (activeTab === "upcoming") baseList = upcoming;
    else if (activeTab === "history") baseList = history;

    return baseList.filter((b) => {
      const sOk =
        filterStatus === "all" ||
        (b.status || "").toUpperCase() === filterStatus.toUpperCase();
      const pOk =
        filterPayment === "all" ||
        (b.paymentType || "").toUpperCase() === filterPayment.toUpperCase();
      return sOk && pOk;
    });
  }, [bookings, activeTab, filterStatus, filterPayment]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Loading dashboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}</h1>
        <p className="text-gray-600 mb-4 text-sm">Manage your rentals & history</p>

        {/* Tabs */}
        <div className="flex gap-3 border-b border-gray-200 overflow-x-auto pb-2 mb-4">
          {["all", "current", "upcoming", "history", "transactions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`capitalize pb-2 border-b-2 ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600 font-semibold"
                  : "border-transparent text-gray-600 hover:text-blue-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filters */}
        {activeTab !== "transactions" && (
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <Link
              href="/equipments"
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              + New Booking
            </Link>
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-2 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending</option>
                <option value="UPDATE_PENDING">Update Pending</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="pl-2 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Payments</option>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Online (Razorpay)</option>
              </select>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab !== "transactions" ? (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <BookingsList
                filteredBookings={filteredBookings}
                handleCancelBooking={handleCancelBooking}
                setSelectedBooking={setSelectedBooking}
              />
            </motion.div>
          ) : (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <TransactionsTab />
            </motion.div>
          )}
        </AnimatePresence>

        {selectedBooking && (
          <ManageBookingModal
            selectedBooking={selectedBooking}
            setSelectedBooking={setSelectedBooking}
            fetchBookings={fetchBookings}
          />
        )}
      </div>
    </div>
  );
}

/* =====================================================
   📋 BOOKINGS LIST
   ===================================================== */
function BookingsList({ filteredBookings, handleCancelBooking, setSelectedBooking }) {
  if (filteredBookings.length === 0)
    return (
      <div className="text-center py-10">
        <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600">No bookings found</p>
      </div>
    );

  return (
    <div className="bg-white border rounded-lg shadow-sm p-4 space-y-3">
      {filteredBookings.map((b) => (
        <div
          key={b.id}
          className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border rounded-md hover:bg-gray-50"
        >
          <div>
            <h3 className="font-semibold text-gray-800">{b.equipment?.name}</h3>
            <p className="text-sm text-gray-600">Ref: {b.referenceId}</p>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-500" />
              {new Date(b.pickupDate).toLocaleDateString()} →{" "}
              {new Date(b.dropDate).toLocaleDateString()}
            </p>
            <span
              className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                b.status === "UPDATE_PENDING"
                  ? "bg-yellow-100 text-yellow-700"
                  : b.status === "CONFIRMED"
                  ? "bg-green-100 text-green-700"
                  : b.status === "CANCELLED"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {b.status}
            </span>
          </div>

          <div className="text-right mt-3 sm:mt-0">
            <div className="text-sm font-semibold text-gray-800">
              ₹{Number(b.totalAmount || 0).toFixed(0)}
            </div>
            {b.status !== "CANCELLED" && (
              <div className="mt-2 flex gap-2 justify-end flex-wrap">
                <button
                  onClick={() => setSelectedBooking(b)}
                  className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                >
                  Request Update
                </button>
                <button
                  onClick={() => handleCancelBooking(b.id)}
                  className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
// function TransactionsTab() {
//   const [transactions, setTransactions] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const userId = localStorage.getItem("userId");
//     if (!userId) return;
//     fetch(`${API_BASE_URL}/api/payment/user/${userId}`)
//       .then((res) => res.json())
//       .then((data) => {
//         if (data.success) setTransactions(data.transactions || []);
//       })
//       .catch((err) => console.error("❌ Fetch transactions failed:", err))
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading)
//     return (
//       <div className="text-center text-gray-500 py-10">Loading transactions...</div>
//     );

//   if (transactions.length === 0)
//     return (
//       <div className="text-center text-gray-500 py-10">No transactions yet</div>
//     );

//   return (
//     <div className="bg-white border rounded-lg shadow-sm p-4 space-y-3">
//       {transactions.map((t) => (
//         <div
//           key={t.id}
//           className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border rounded-md hover:bg-gray-50"
//         >
//           <div>
//             <h3 className="font-semibold text-gray-800">₹{t.amount}</h3>
//             <p className="text-sm text-gray-600">
//               {new Date(t.createdAt).toLocaleString()}
//             </p>
//             <span
//               className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
//                 t.status === "FAILED"
//                   ? "bg-red-100 text-red-700"
//                   : "bg-green-100 text-green-700"
//               }`}
//             >
//               {t.status}
//             </span>
//           </div>
//           <div className="text-right mt-3 sm:mt-0">
//             <div className="text-xs text-gray-500">Method: {t.paymentType}</div>
//             <div className="text-xs text-gray-500">Txn ID: {t.paymentId}</div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

/* =====================================================
   ⚙️ MANAGE BOOKING MODAL
   ===================================================== */
// function ManageBookingModal({ selectedBooking, setSelectedBooking, fetchBookings }) {
//   const [updateRange, setUpdateRange] = useState([
//     {
//       startDate: new Date(selectedBooking?.pickupDate || new Date()),
//       endDate: addDays(new Date(selectedBooking?.dropDate || new Date()), 1),
//       key: "selection",
//     },
//   ]);
//   const [saving, setSaving] = useState(false);

//   const handleUpdateRequest = async () => {
//     setSaving(true);
//     try {
//       const pickupDate = updateRange[0].startDate;
//       const dropDate = updateRange[0].endDate;

//       const check = await fetch(
//         `${API_BASE_URL}/api/bookings/check-availability?equipmentId=${selectedBooking.equipmentId}&from=${pickupDate.toISOString()}&to=${dropDate.toISOString()}&excludeId=${selectedBooking.id}`
//       );
//       const data = await check.json();

//       if (!data.available) {
//         alert("❌ This equipment is already booked for that range.");
//         setSaving(false);
//         return;
//       }

//       const res = await fetch(
//         `${API_BASE_URL}/api/bookings/user/update/${selectedBooking.id}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             pickupDate,
//             dropDate,
//             updateRequest: true, // mark it for vendor approval
//           }),
//         }
//       );
//       const result = await res.json();

//       if (result.success) {
//         alert("✅ Update request sent to vendor for approval!");
//         fetchBookings();
//         setSelectedBooking(null);
//       } else {
//         alert(result.message || "Failed to request update");
//       }
//     } catch (err) {
//       console.error("❌ Update request error:", err);
//       alert("Request failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (!selectedBooking) return null;

//   return (
//     <AnimatePresence>
//       <motion.div
//         className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//       >
//         <motion.div
//           className="bg-white rounded-2xl shadow-xl p-6 w-[95%] max-w-lg"
//           initial={{ scale: 0.9 }}
//           animate={{ scale: 1 }}
//           exit={{ scale: 0.9 }}
//         >
//           <h2 className="text-xl font-semibold text-[#14213D] mb-3">
//             Request Booking Update
//           </h2>
//           <p className="text-gray-600 text-sm mb-2">
//             Equipment: <b>{selectedBooking.equipment?.name}</b>
//           </p>

//           <DateRange
//             ranges={updateRange}
//             onChange={(item) => setUpdateRange([item.selection])}
//             minDate={new Date()}
//             rangeColors={["#2563EB"]}
//             showDateDisplay={false}
//           />

//           <div className="mt-5 flex flex-col gap-2">
//             <button
//               onClick={handleUpdateRequest}
//               disabled={saving}
//               className={`px-4 py-2 rounded-md font-semibold ${
//                 saving
//                   ? "bg-gray-400 text-white"
//                   : "bg-blue-600 hover:bg-blue-700 text-white"
//               }`}
//             >
//               {saving ? "Submitting..." : "Send Update Request"}
//             </button>
//             <button
//               onClick={() => setSelectedBooking(null)}
//               className="px-4 py-2 rounded-md border text-gray-600 hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//           </div>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }
