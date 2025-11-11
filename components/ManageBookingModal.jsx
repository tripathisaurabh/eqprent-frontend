"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DateRange } from "react-date-range";
import { addDays, isWithinInterval } from "date-fns";

export default function ManageBookingModal({
  selectedBooking,
  setSelectedBooking,
  fetchBookings,
}) {
  const [updateRange, setUpdateRange] = useState([
    {
      startDate: new Date(selectedBooking?.dropDate || new Date()),
      endDate: addDays(new Date(selectedBooking?.dropDate || new Date()), 1),
      key: "selection",
    },
  ]);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [saving, setSaving] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  // ✅ Fetch blocked date ranges
  useEffect(() => {
    if (!selectedBooking?.equipmentId) return;
    const loadUnavailable = async () => {
      try {
        const res = await fetch(
          `http://localhost:5001/api/bookings/unavailable/${selectedBooking.equipmentId}`
        );
        const data = await res.json();
        if (data.success) {
          setUnavailableDates(
            data.dates.map((d) => ({
              start: new Date(d.pickupDate),
              end: new Date(d.dropDate),
            }))
          );
        }
      } catch (err) {
        console.error("❌ Failed to load unavailable dates:", err);
      }
    };
    loadUnavailable();
  }, [selectedBooking]);

  // ✅ Properly check date blocks (Date objects, not timestamps)
  const isBlocked = (day) => {
    return unavailableDates.some((range) =>
      isWithinInterval(day, {
        start: new Date(range.start),
        end: new Date(range.end),
      })
    );
  };

  const handleExtend = async () => {
    setSaving(true);
    try {
      const newEnd = updateRange[0].endDate;
      const eqId = selectedBooking.equipmentId;

      // check overlap
      const check = await fetch(
        `http://localhost:5001/api/bookings/check-availability?equipmentId=${eqId}&from=${selectedBooking.dropDate}&to=${newEnd.toISOString()}&excludeId=${selectedBooking.id}`
      );
      const avail = await check.json();
      if (!avail.available) {
        alert("❌ Equipment is booked in that range.");
        setSaving(false);
        return;
      }

      const extraDays = Math.ceil(
        (newEnd - new Date(selectedBooking.dropDate)) / (1000 * 60 * 60 * 24)
      );
      if (extraDays <= 0) {
        alert("Select a future date");
        setSaving(false);
        return;
      }

      const extraCost = extraDays * (selectedBooking.equipment?.price || 0);
      if (
        !confirm(
          `Extend by ${extraDays} day(s) — Extra ₹${extraCost}. Continue?`
        )
      ) {
        setSaving(false);
        return;
      }

      if (["ONLINE", "UPI"].includes(paymentMethod)) {
        const order = await fetch("http://localhost:5001/api/payment/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: extraCost,
            currency: "INR",
            receipt: `extend_${selectedBooking.id}_${Date.now()}`,
          }),
        });
        const data = await order.json();
        if (!data.success) throw new Error("Order creation failed");

        await new Promise((resolve, reject) => {
          if (window.Razorpay) return resolve();
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = resolve;
          s.onerror = reject;
          document.body.appendChild(s);
        });

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.order.amount,
          currency: "INR",
          name: "HeavyEquip Rentals",
          order_id: data.order.id,
          handler: async (res) => {
            await fetch("http://localhost:5001/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...res,
                bookingData: {
                  bookingId: selectedBooking.id,
                  userId: localStorage.getItem("userId"),
                  totalCost: extraCost,
                  paymentType: "CARD",
                },
              }),
            });
            await fetch(
              `http://localhost:5001/api/bookings/user/update/${selectedBooking.id}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  dropDate: newEnd,
                  updateRequest: true,
                  extraCost,
                  paymentType: "CARD",
                }),
              }
            );
            alert("✅ Request sent for vendor approval!");
            fetchBookings();
            setSelectedBooking(null);
          },
          theme: { color: "#14213D" },
        };
        new window.Razorpay(options).open();
      } else {
        const res = await fetch(
          `http://localhost:5001/api/bookings/user/update/${selectedBooking.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              dropDate: newEnd,
              updateRequest: true,
              extraCost,
              paymentType,
            }),
          }
        );
        const data = await res.json();
        if (data.success) {
          alert("✅ Request sent for vendor approval!");
          fetchBookings();
          setSelectedBooking(null);
        } else alert(data.message || "Failed to update booking");
      }
    } catch (err) {
      console.error("❌ Extension error:", err);
      alert("Extension failed, try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!selectedBooking) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="bg-white rounded-2xl shadow-xl p-6 w-[95%] max-w-lg"
        >
          <h2 className="text-2xl font-semibold text-[#14213D] mb-4">
            Extend Booking
          </h2>
          <p className="text-gray-600 mb-3">
            Equipment: <b>{selectedBooking.equipment?.name}</b>
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Current end date:{" "}
            <b>{new Date(selectedBooking.dropDate).toLocaleDateString()}</b>
          </p>

          {/* 📅 Date Picker */}
          <DateRange
            ranges={updateRange}
            onChange={(item) => setUpdateRange([item.selection])}
            minDate={new Date(selectedBooking.dropDate)}
            rangeColors={["#2563EB"]}
            showDateDisplay={false}
            dayContentRenderer={(day) => (
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                  isBlocked(day)
                    ? "bg-red-200 text-red-700 cursor-not-allowed"
                    : "hover:bg-blue-100"
                }`}
              >
                {day.getDate()}
              </div>
            )}
          />

          {/* 💳 Payment Selection */}
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Choose Payment Method
            </h3>
            <div className="flex gap-3">
              {["CASH", "UPI", "ONLINE"].map((method) => (
                <div
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`px-3 py-2 border rounded-md text-sm cursor-pointer transition ${
                    paymentMethod === method
                      ? "bg-blue-100 border-blue-500 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {method === "ONLINE" ? "Razorpay" : method}
                </div>
              ))}
            </div>
          </div>

          {/* ✅ Buttons */}
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={handleExtend}
              disabled={saving}
              className={`px-4 py-2 rounded-md font-semibold ${
                saving
                  ? "bg-gray-400 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {saving ? "Processing..." : "Confirm Extension"}
            </button>
            <button
              onClick={() => setSelectedBooking(null)}
              className="px-4 py-2 rounded-md border text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
