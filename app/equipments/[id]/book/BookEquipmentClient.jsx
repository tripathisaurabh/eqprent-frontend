"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  MapPin,
  Loader2,
  CreditCard,
  Wallet,
  Truck,
  Calendar,
} from "lucide-react";
import { DateRange } from "react-date-range";
import { addDays, isWithinInterval, format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { API_BASE_URL } from "@/lib/apiConfig";

export function BookEquipmentClient({ equipmentId }) {
  const searchParams = useSearchParams();
  const calendarRef = useRef(null);

  const [equipment, setEquipment] = useState(null);
  const [unavailableRanges, setUnavailableRanges] = useState([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refId, setRefId] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    address: "",
    paymentMethod: "upi",
  });
  const [travelCost, setTravelCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 1),
      key: "selection",
    },
  ]);

  // ✅ Reset all data when equipment changes
  useEffect(() => {
    setEquipment(null);
    setUnavailableRanges([]);
    setRefId(null);
    setError("");
    setForm({ name: "", address: "", paymentMethod: "upi" });
  }, [equipmentId]);

  // ✅ Load travel cost
  useEffect(() => {
    const travelParam = searchParams.get("travel");
    let parsed = 0;
    if (travelParam && !isNaN(parseFloat(travelParam))) {
      parsed = parseFloat(travelParam);
    } else {
      const stored = localStorage.getItem("latestTravelCost");
      if (stored && !isNaN(parseFloat(stored))) parsed = parseFloat(stored);
    }
    setTravelCost(parsed);
  }, [searchParams]);

  /* =====================================================
     🔹 Fetch Equipment + Unavailable Dates
  ===================================================== */
 /* =====================================================
   🔹 Fetch Equipment + Unavailable Dates
===================================================== */
useEffect(() => {
  async function load() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/equipments/${equipmentId}`);
      const eq = await res.json();

      if (!eq || !eq.success) {
        setError("Equipment not found.");
        return;
      }

      // ✅ STORE ONLY THE EQUIPMENT OBJECT
      setEquipment(eq.equipment);

      // Fetch unavailable dates using correct equipment id
      const booked = await fetch(
        `${API_BASE_URL}/api/bookings/unavailable/${eq.equipment.id}`
      );
      const bookedData = await booked.json();

      if (bookedData.success) {
        setUnavailableRanges(
          bookedData.dates.map((b) => ({
            start: new Date(b.pickupDate),
            end: new Date(b.dropDate),
          }))
        );
      }
    } catch (err) {
      console.error("❌ Error loading equipment:", err);
      setError("Failed to load equipment details.");
    }
  }

  load();
}, [equipmentId]);

  /* =====================================================
     🔹 Compute Total Cost
  ===================================================== */
  useEffect(() => {
    if (!equipment) return;
    const basePrice = parseFloat(equipment.price) || 0;
    const days = Math.max(
      1,
      Math.ceil((range[0].endDate - range[0].startDate) / (1000 * 60 * 60 * 24))
    );
    const baseTotal = basePrice * days + (Number(travelCost) || 0);
    const platformFee = baseTotal * 0.01;
    setTotalCost((baseTotal + platformFee).toFixed(2));
  }, [equipment, range, travelCost]);

  /* =====================================================
     🔹 Helpers
  ===================================================== */
  const isDateBlocked = (date) =>
    unavailableRanges.some((r) =>
      isWithinInterval(date, { start: r.start, end: r.end })
    );

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /* =====================================================
     🔹 Booking Submit (COD + UPI)
  ===================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setRefId(null);
    setLoading(true);

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("Please log in to continue.");
      setLoading(false);
      return;
    }
    if (!equipment) {
      setError("Equipment not loaded.");
      setLoading(false);
      return;
    }
    if (!form.address.trim()) {
      setError("Please enter a delivery address.");
      setLoading(false);
      return;
    }

    const payload = {
      name: form.name,
      pickupDate: range[0].startDate,
      dropDate: range[0].endDate,
      address: form.address,
      equipmentId: equipment.id,
      travelCost: Number(travelCost),
      totalCost: Number(totalCost),
      userId: Number(userId),
    };

    try {
      // ✅ Cash on Delivery
      if (form.paymentMethod === "cod") {
        const res = await fetch(`${API_BASE_URL}/
api/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, paymentType: "CASH" }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Booking failed");
        setRefId(data.referenceId);
        setTimeout(() => {
          window.location.href = `/equipments/${equipment.id}`;
        }, 2000);
        return;
      }

      // ✅ UPI / Razorpay
      const orderRes = await fetch(`${API_BASE_URL}/
api/payment/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(totalCost),
          currency: "INR",
          receipt: `booking_${Date.now()}`,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error("Failed to create payment order.");

      // Load Razorpay SDK
      await new Promise((resolve, reject) => {
        if (window.Razorpay) return resolve();
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = resolve;
        script.onerror = () => reject("Razorpay SDK load failed");
        document.body.appendChild(script);
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: "HeavyEquip Rentals",
        description: equipment.name,
        image: "/logo.png",
        order_id: orderData.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await fetch(
              `${API_BASE_URL}/api/payment/verify`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...response,
                  bookingData: payload,
                }),
              }
            );
            const verifyData = await verifyRes.json();
            if (!verifyData.success)
              throw new Error("Payment verification failed.");
            setRefId(verifyData.referenceId);
            setForm({ name: "", address: "", paymentMethod: "upi" });
            setCalendarOpen(false);
            setTimeout(() => {
              window.location.href = `/equipments/${equipment.id}`;
            }, 2000);
          } catch (err) {
            console.error("❌ Post-payment error:", err);
            setError(
              "Payment successful but booking creation failed. Contact support."
            );
          }
        },
        prefill: {
          name: form.name,
          email: localStorage.getItem("userEmail") || "",
        },
        theme: { color: "#14213D" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        console.error("❌ Payment failed:", response.error);
        alert("❌ Payment failed or cancelled");
      });
      rzp.open();
    } catch (err) {
      console.error("❌ Booking error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     🔹 UI
  ===================================================== */
  if (!equipment && !error)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading equipment details...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-28 pb-16 px-4 flex justify-center">
      {!refId ? (
        !equipment ? (
          <div className="text-gray-500 text-center py-10">
            Loading equipment...
          </div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-3xl border border-gray-200"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-[#14213D] mb-6 text-center">
              Checkout — {equipment?.name || "Equipment"}
            </h1>

            <InputField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />

            <CalendarPicker
              calendarRef={calendarRef}
              range={range}
              setRange={setRange}
              calendarOpen={calendarOpen}
              setCalendarOpen={setCalendarOpen}
              unavailableRanges={unavailableRanges}
              isDateBlocked={isDateBlocked}
            />

            <div className="relative mb-6">
              <MapPin className="absolute left-3 top-3 text-gray-400" />
              <textarea
                name="address"
                rows={3}
                placeholder="Enter delivery address or site location"
                value={form.address}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 pl-10 focus:ring focus:ring-blue-100 outline-none"
              />
            </div>

            {equipment && (
              <Summary
                equipment={equipment}
                travelCost={travelCost}
                totalCost={totalCost}
              />
            )}

            <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
              Select Payment Method
            </h2>
            <div className="flex flex-col gap-3 mb-8">
              <PaymentOption
                value="upi"
                label="UPI / Online Payment"
                icon={<Wallet className="text-blue-600 h-5 w-5" />}
                checked={form.paymentMethod === "upi"}
                onChange={handleChange}
              />
              <PaymentOption
                value="cod"
                label="Cash on Delivery"
                icon={<CreditCard className="text-green-600 h-5 w-5" />}
                checked={form.paymentMethod === "cod"}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold py-3 rounded-md transition flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#14213D] hover:bg-blue-700 text-white"
              }`}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Truck className="h-5 w-5" />
              )}
              {loading ? "Processing..." : "Confirm Booking"}
            </button>

            {error && (
              <p className="text-red-500 text-center mt-3 text-sm">{error}</p>
            )}
          </motion.form>
        )
      ) : (
        <motion.div
          className="bg-white shadow-lg rounded-2xl p-8 border border-gray-200 text-center w-full max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-semibold text-green-600 mb-3">
            Booking Confirmed!
          </h2>
          <p className="text-gray-700 mb-2">Your booking reference ID:</p>
          <p className="text-3xl font-bold text-[#14213D] tracking-wider">
            {refId}
          </p>
          <p className="text-gray-500 mt-4">
            Redirecting to equipment details...
          </p>
        </motion.div>
      )}
    </div>
  );
}

/* ------------------------------ Components ------------------------------ */
function InputField({ label, name, type = "text", value, onChange }) {
  return (
    <div className="mb-5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:ring focus:ring-blue-100 outline-none"
      />
    </div>
  );
}

function PaymentOption({ value, label, icon, checked, onChange }) {
  return (
    <label
      className={`flex items-center gap-3 border ${
        checked ? "border-blue-600 bg-blue-50" : "border-gray-300"
      } rounded-md px-4 py-3 hover:bg-gray-50 cursor-pointer transition`}
    >
      <input
        type="radio"
        name="paymentMethod"
        value={value}
        checked={checked}
        onChange={onChange}
      />
      {icon}
      <span className="text-gray-800 font-medium">{label}</span>
    </label>
  );
}

function Summary({ equipment, travelCost, totalCost }) {
  if (!equipment) return null;
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Booking Summary
      </h3>
      <div className="flex justify-between text-gray-700 mb-2">
        <span>Equipment Price:</span>
        <span>₹{equipment?.price ?? 0}</span>
      </div>
      <div className="flex justify-between text-gray-700 mb-2">
        <span>Transport Cost:</span>
        <span>₹{travelCost}</span>
      </div>
      <div className="flex justify-between font-bold text-gray-900 text-lg border-t pt-3">
        <span>Total Amount:</span>
        <span className="text-green-700">₹{totalCost}</span>
      </div>
    </div>
  );
}

function CalendarPicker({
  calendarRef,
  range,
  setRange,
  calendarOpen,
  setCalendarOpen,
  unavailableRanges,
  isDateBlocked,
}) {
  return (
    <div className="mb-6 relative" ref={calendarRef}>
      <label className="text-sm font-medium text-gray-700 mb-2 block">
        Select Rental Duration
      </label>
      <div
        onClick={() => setCalendarOpen(!calendarOpen)}
        className="flex items-center justify-between w-full border border-gray-300 rounded-md px-4 py-3 cursor-pointer hover:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm"
      >
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span className="font-medium">
            {format(range[0].startDate, "dd MMM yyyy")} →{" "}
            {format(range[0].endDate, "dd MMM yyyy")}
          </span>
        </div>
        <span className="text-sm text-gray-500">Click to change</span>
      </div>

      <AnimatePresence>
        {calendarOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="absolute z-50 mt-3 bg-white border-2 border-blue-100 shadow-2xl rounded-2xl p-4 w-full sm:w-[480px]"
          >
            <DateRange
              ranges={range}
              onChange={(item) => {
                const { startDate, endDate } = item.selection;
                const overlap = unavailableRanges.some(
                  (r) => startDate <= r.end && endDate >= r.start
                );
                if (overlap) {
                  alert("⚠️ Selected range includes unavailable dates.");
                  return;
                }
                setRange([item.selection]);
              }}
              minDate={new Date()}
              rangeColors={["#2563EB"]}
              showDateDisplay={false}
              moveRangeOnFirstSelection={false}
              dayContentRenderer={(day) => {
                const blocked = isDateBlocked(day);
                return (
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                      blocked
                        ? "border-2 border-red-500 bg-red-100 text-red-700 cursor-not-allowed"
                        : "hover:bg-blue-100"
                    }`}
                  >
                    {day.getDate()}
                  </div>
                );
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
