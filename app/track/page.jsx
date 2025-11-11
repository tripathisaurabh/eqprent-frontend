"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/apiConfig";

export default function TrackBooking() {
  const [form, setForm] = useState({ refId: "", mobileSuffix: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setResult(null);
  setLoading(true);

  try {
    const res = await fetch(`${API_BASE_URL}/
api/bookings/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refId: form.refId,
        last4: form.mobileSuffix, // ✅ match backend
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || "Invalid details");

    setResult(data); // ✅ backend already returns flat response (not inside data.booking)
  } catch (err) {
    setError(err.message || "Something went wrong!");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 px-4 pt-36 pb-16">
      {/* ===== HEADER ===== */}
      <motion.h1
        className="text-4xl md:text-5xl font-extrabold text-[#14213D] mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Track Your Booking
      </motion.h1>

      <motion.p
        className="text-gray-600 mb-10 text-center max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Enter your <span className="font-semibold">Booking Reference ID</span> and
        <span className="font-semibold"> last 4 digits of your registered mobile number</span> to view booking status.
      </motion.p>

      {/* ===== FORM ===== */}
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-6 md:p-8 w-full max-w-lg border border-gray-200"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex flex-col mb-5">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Booking Reference ID
          </label>
          <input
            type="text"
            name="refId"
            placeholder="e.g., BOOK-00048"
            value={form.refId}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-md px-4 py-2 focus:ring focus:ring-blue-100 outline-none text-gray-800"
          />
        </div>

        <div className="flex flex-col mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2">
            Last 4 digits of registered mobile number
          </label>
          <input
            type="text"
            name="mobileSuffix"
            value={form.mobileSuffix}
            onChange={handleChange}
            required
            maxLength={4}
            pattern="\d{4}"
            placeholder="e.g., 4821"
            className="border border-gray-300 rounded-md px-4 py-2 focus:ring focus:ring-blue-100 outline-none text-gray-800"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#14213D] text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-70"
        >
          {loading ? "Checking..." : "Track Booking"}
        </button>

        {error && (
          <p className="text-red-500 text-center mt-4 text-sm font-medium">
            {error}
          </p>
        )}
      </motion.form>

      {/* ===== RESULT ===== */}
{result && (
  <motion.div
    className="mt-10 bg-white rounded-xl shadow-lg p-6 border border-gray-200 w-full max-w-lg"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <h2 className="text-xl font-semibold text-[#14213D] mb-4 text-center">
      Booking Details
    </h2>

    <div className="text-gray-700 text-sm space-y-2">
      <p><strong>Reference ID:</strong> {result.refId}</p>
      <p><strong>Name:</strong> {result.name}</p>
      <p><strong>Equipment:</strong> {result.equipment}</p>

      <p>
        <strong>Status:</strong>{" "}
        <span
          className={`font-semibold ${
            result.status === "CONFIRMED"
              ? "text-green-600"
              : result.status === "PENDING"
              ? "text-yellow-600"
              : result.status === "CANCELLED"
              ? "text-red-600"
              : "text-gray-600"
          }`}
        >
          {result.status}
        </span>
      </p>

      {result.status === "CANCELLED" && (
        <>
          <p className="text-red-500 font-medium mt-2">
            {result.cancelledMsg}
          </p>
          <p>
            <strong>Cancelled On:</strong>{" "}
            {new Date(result.cancelledAt).toLocaleString()}
          </p>
        </>
      )}

      <p>
        <strong>Pickup:</strong> {new Date(result.pickupDate).toLocaleDateString()}
      </p>
      <p>
        <strong>Drop:</strong> {new Date(result.dropDate).toLocaleDateString()}
      </p>

      {result.lastEvent && (
        <p>
          <strong>Last Update:</strong> {result.lastEvent}
        </p>
      )}
    </div>
  </motion.div>
)}

    </div>
  );
}
