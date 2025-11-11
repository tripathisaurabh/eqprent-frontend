"use client";
import Script from "next/script";
import { useState } from "react";

export default function BookingPayment({ totalAmount, user, bookingData, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // --- Validate required bookingData before creating order ---
      const required = ["equipmentId", "pickupDate", "dropDate"];
      const missing = required.filter((k) => !bookingData?.[k]);
      if (missing.length > 0) {
        alert(`Missing booking info: ${missing.join(", ")}`);
        setLoading(false);
        return;
      }

      // ✅ Create Razorpay order
      const orderRes = await fetch("http://localhost:5001/api/payment/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(totalAmount),
          currency: "INR",
          receipt: `booking_${Date.now()}`,
        }),
      });

      const { order } = await orderRes.json();
      if (!order) throw new Error("❌ Razorpay order not created");

      // ✅ Prepare complete booking data payload (exact keys backend expects)
      const fullBookingData = {
        userId: user?.id || localStorage.getItem("userId"),
        name: user?.name || "Guest User",
        email: user?.email || "guest@example.com",
        pickupDate: bookingData?.pickupDate,
        dropDate: bookingData?.dropDate,
        address: bookingData?.address || "",
        equipmentId: bookingData?.equipmentId,
        totalCost: Number(totalAmount) || 0,
      };

      console.log("🧾 Sending booking data to verify:", fullBookingData);

      // ✅ Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "HeavyEquip Rentals",
        description: bookingData?.equipmentName || "Equipment Booking",
        order_id: order.id,

        // 🟢 Payment success handler
handler: async (response) => {
  try {
    const verifyRes = await fetch("http://localhost:5001/api/payment/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...response,
        bookingData: payload, // ✅ send booking data directly to backend
      }),
    });

    const verifyData = await verifyRes.json();
    if (!verifyData.success) throw new Error("Payment verification failed.");

    // ✅ Booking created inside backend; show reference
    setRefId(verifyData.referenceId);

    // ✅ FIX: Close form, clear data, and optionally redirect after small delay
    setForm({ name: "", address: "", paymentMethod: "upi" });
    setCalendarOpen(false);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);

  } catch (err) {
    console.error("❌ Post-payment error:", err);
    setError("Payment successful but booking creation failed. Contact support.");
  }
},


        prefill: {
          name: user?.name || "Guest",
          email: user?.email || "guest@example.com",
        },
        theme: { color: "#14213D" },
      };

      const rzp = new window.Razorpay(options);

      // 🔴 Handle payment failure or cancellation
      rzp.on("payment.failed", async (response) => {
        console.error("❌ Payment failed:", response?.error);

        try {
          await fetch("http://localhost:5001/api/payment/save-transaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId: bookingData?.id || null,
              amount: Number(totalAmount) || 0,
              status: "FAILED",
              razorpayOrderId: response?.error?.metadata?.order_id,
              razorpayPaymentId: response?.error?.metadata?.payment_id,
              paymentMethod: response?.error?.reason || "FAILED",
            }),
          });
        } catch (e) {
          console.error("❌ Failed to save failed-transaction log:", e);
        }

        alert("❌ Payment failed or cancelled");
      });

      // 🟡 Open Razorpay checkout
      rzp.open();
    } catch (err) {
      console.error("❌ Payment Error:", err);
      alert("❌ Unable to start payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Load Razorpay checkout script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayReady(true)}
      />

      <button
        onClick={handlePayment}
        disabled={loading || !razorpayReady}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium mt-4"
      >
        {loading ? "Processing..." : `Pay ₹${totalAmount}`}
      </button>
    </>
  );
}
