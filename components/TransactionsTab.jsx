"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/apiConfig";

export default function TransactionsTab() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    fetch(`${API_BASE_URL}/api/transactions/user/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("🧾 Transactions API response:", data);
        if (data.success) setTransactions(data.items || []);
      })
      .catch((err) => console.error("❌ Fetch transactions failed:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <div className="text-center text-gray-500 py-10">Loading transactions...</div>;

  if (transactions.length === 0)
    return <div className="text-center text-gray-500 py-10">No transactions yet</div>;

  return (
    <div className="bg-white border rounded-lg shadow-sm p-4 space-y-3">
      {transactions.map((t) => (
        <div
          key={t.id}
          className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border rounded-md hover:bg-gray-50"
        >
          <div>
            <h3 className="font-semibold text-gray-800">
              ₹{t.booking?.totalAmount || t.amount}
            </h3>

            <p className="text-sm text-gray-600">
              {new Date(t.createdAt).toLocaleString()}
            </p>

            <span
              className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                t.status === "FAILED"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {t.status}
            </span>
          </div>

          <div className="text-right mt-3 sm:mt-0">
            <div className="text-xs text-gray-500">
              Method: {t.booking?.paymentType || "N/A"}
            </div>
            <div className="text-xs text-gray-500">
              Ref: {t.booking?.referenceId || "—"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
