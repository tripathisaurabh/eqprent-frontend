"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Package } from "lucide-react";
import { normalizeImages } from "@/lib/image";

export default function EquipmentCard({
  equipment,
  days = 1,
  travelCost = 0,
  totalAmount,
  pickupDate,
  dropDate,
}) {
  /* -------------------------------------
     🖼️ Image normalization (bulletproof)
  ------------------------------------- */
const normalizedImages = normalizeImages(equipment?.images);
console.log("🧠 Normalized Images:", normalizedImages);


  const [currentIdx, setCurrentIdx] = useState(0);
  const displayImage = normalizedImages[currentIdx] || "/no-image.png";

  /* -------------------------------------
     💰 Cost Calculations
  ------------------------------------- */
  const perDay = parseFloat(equipment.price) || 0;
  const baseCost = perDay * days;
  const travel = parseFloat(travelCost) || 0;
  const platformFee = (baseCost + travel) * 0.01;
  const finalTotal = Number(totalAmount ?? baseCost + travel + platformFee);

  /* -------------------------------------
     🎨 UI Layout
  ------------------------------------- */
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition"
    >
      {/* Image section */}
      <div className="relative w-full h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
        {normalizedImages.length > 0 ? (
          <>
            <img
              src={displayImage}
              alt={equipment.name || "Equipment"}
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.src = "/no-image.png")}
            />
            {normalizedImages.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                {normalizedImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`h-2 w-2 rounded-full ${
                      i === currentIdx ? "bg-blue-600" : "bg-white/70"
                    }`}
                  ></button>
                ))}
              </div>
            )}
          </>
        ) : (
          <Package className="h-12 w-12 text-gray-400" />
        )}
      </div>

      {/* Info */}
      <div className="p-5 space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          {equipment.name || "Unnamed Equipment"}
        </h2>
        <p className="text-sm text-gray-600">Type: {equipment.type || "N/A"}</p>

        {/* Cost */}
        <div className="bg-gray-50 rounded-md p-3 text-sm border border-gray-200">
          <div className="flex justify-between">
            <span>
              ₹{perDay}/day × {days} day{days > 1 ? "s" : ""}
            </span>
            <span>₹{baseCost.toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span>Travel Cost</span>
            <span>₹{travel.toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span>Platform Fee (1%)</span>
            <span>₹{platformFee.toFixed(0)}</span>
          </div>
          <hr className="my-1" />
          <div className="flex justify-between font-semibold text-green-700">
            <span>Total Estimate</span>
            <span>₹{finalTotal.toFixed(0)}</span>
          </div>
        </div>

        {/* Dates */}
        {pickupDate && dropDate && (
          <p className="text-xs text-gray-500 italic">
            {new Date(pickupDate).toLocaleDateString()} →{" "}
            {new Date(dropDate).toLocaleDateString()}
          </p>
        )}

        {/* Description */}
        <p className="text-gray-700 text-sm line-clamp-2">
          {equipment.description || "No description available."}
        </p>

        {/* Vendor */}
        <p className="text-xs text-gray-500">
          Vendor: {equipment.vendor?.companyName || equipment.vendor?.name || "Unknown"}
        </p>

        {/* Buttons */}
        <div className="flex gap-2 mt-3">
          <Link
            href={`/equipments/${equipment.id}`}
            className="flex-1 text-center py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            View Details
          </Link>

          <Link
            href={`/equipments/${equipment.id}/book?name=${encodeURIComponent(
              equipment.name
            )}&price=${perDay}&days=${days}&travel=${travel}&total=${finalTotal}&from=${
              pickupDate || ""
            }&to=${dropDate || ""}`}
            className="flex-1 text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Book Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
