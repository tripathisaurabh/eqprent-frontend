"use client";

import Script from "next/script";
import { useState } from "react";
import { API_BASE_URL } from "@/lib/apiConfig";

export default function BookingPayment({ totalAmount, user, bookingData }) {
  const [loading, setLoading] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // 🔹 1. Create Razorpay Order from backend
      const orderRes = await fetch(`${API_BASE_URL}/api/payment/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(totalAmount),
          currency: "INR",
          receipt: `booking_${Date.now()}`
        }),
      });

      const { order, success } = await orderRes.json();
      if (!success || !order) throw new Error("Order creation failed");

      // 🔹 2. Build booking data EXACTLY as backend expects
      const fullBooking = {
        userId: user?.id || Number(localStorage.getItem("userId")),
        name: user?.name || "Guest User",
        pickupDate: bookingData.pickupDate,
        dropDate: bookingData.dropDate,
        address: bookingData.address,
        equipmentId: bookingData.equipmentId,
        totalCost: Number(totalAmount),
      };

      // 🔹 3. Razorpay Checkout options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // test key
        amount: order.amount,
        currency: "INR",
        name: "HeavyEquip Rentals",
        description: bookingData?.equipmentName || "Equipment Booking",
        order_id: order.id,

        handler: async (response) => {
          // 🔹 4. Payment verification
          const verifyRes = await fetch(`${API_BASE_URL}/api/payment/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              bookingData: fullBooking,
            }),
          });

          const verifyData = await verifyRes.json();
          if (!verifyData.success) {
            alert("❌ Payment verification failed");
            return;
          }

          alert("✅ Payment successful!");
          console.log("BOOKING ID:", verifyData.bookingId);
        },

        theme: { color: "#14213D" },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", async (response) => {
        console.error("PAYMENT FAILED:", response.error);

        await fetch(`${API_BASE_URL}/api/payment/save-transaction`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: null,
            amount: Number(totalAmount),
            status: "FAILED",
            razorpayOrderId: response?.error?.metadata?.order_id,
            razorpayPaymentId: response?.error?.metadata?.payment_id,
            paymentMethod: "FAILED",
          }),
        });

        alert("❌ Payment Failed");
      });

      rzp.open();
    } catch (err) {
      console.error("Payment Error:", err);
      alert("❌ Unable to start payment. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayReady(true)}
      />

      <button
        onClick={handlePayment}
        disabled={loading || !razorpayReady}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold mt-4"
      >
        {loading ? "Processing..." : `Pay ₹${totalAmount}`}
      </button>
    </>
  );
}
