"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import TravelCostCalculator from "@/components/TravelCostCalculator";
import {
  MapPin,
  IndianRupee,
  Truck,
  Shield,
  Star,
  Navigation,
  Calendar,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/apiConfig";

/* ------------------------------------------------------------------
    PAGE COMPONENT
------------------------------------------------------------------- */
export default function EquipmentDetailPage() {
  const { id } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  /* ---------------- FETCH SINGLE EQUIPMENT ---------------- */
  useEffect(() => {
    if (!id) return;

    fetch(`${API_BASE_URL}/api/equipments/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setEquipment(data.equipment);
        else console.error("Invalid API response", data);
      })
      .catch((err) => console.error("Error fetching equipment:", err));
  }, [id]);

  if (!equipment)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Loading equipment details...
          </p>
        </div>
      </div>
    );

  /* ---------------- IMAGE NORMALIZER ---------------- */
  const normalizeImageUrl = (img) => {
    if (!img) return "/placeholder.jpg";

    if (typeof img === "string") {
      return img.startsWith("http")
        ? img
        : `${API_BASE_URL}${img.startsWith("/") ? img : "/" + img}`;
    }

    if (typeof img === "object" && img.url) {
      if (typeof img.url === "string") {
        return img.url.startsWith("http")
          ? img.url
          : `${API_BASE_URL}${img.url.startsWith("/") ? img.url : "/" + img.url}`;
      }

      if (typeof img.url === "object" && img.url.path) {
        return `${API_BASE_URL}${img.url.path}`;
      }
    }
    return "/placeholder.jpg";
  };

  const images = Array.isArray(equipment.images)
    ? equipment.images.map((img) => normalizeImageUrl(img))
    : ["/placeholder.jpg"];

  const handleImageNav = (direction) => {
    setActiveImage((prev) =>
      direction === "next"
        ? (prev + 1) % images.length
        : (prev - 1 + images.length) % images.length
    );
  };

  /* ------------------------------------------------------------------
      UI
  ------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/equipments" className="hover:text-blue-600 transition">
            Equipment
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{equipment.type}</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* LEFT COLUMN — IMAGES + MAP */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="relative group">
                <img
                  src={images[activeImage]}
                  alt={equipment.name}
                  className="w-full h-[500px] object-cover"
                  onError={(e) => (e.target.src = "/placeholder.jpg")}
                />

                {/* Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => handleImageNav("prev")}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-800" />
                    </button>
                    <button
                      onClick={() => handleImageNav("next")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-800" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                  {activeImage + 1} / {images.length}
                </div>

                {/* Verified Badge */}
                <div className="absolute top-4 left-4 bg-green-600 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Verified
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 p-4 bg-gray-50 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-24 h-24 border-2 rounded-xl overflow-hidden ${
                        activeImage === i
                          ? "border-blue-600"
                          : "border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Travel Cost Estimator */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 bg-blue-50">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                  <Truck className="w-5 h-5 text-blue-600" />
                  Estimate Travel Cost
                </h4>

                {equipment.baseLat && equipment.baseLng ? (
                  <TravelCostCalculator
                    baseLat={equipment.baseLat}
                    baseLng={equipment.baseLng}
                    perKmRate={equipment.perKmRate}
                  />
                ) : (
                  <div className="p-6 bg-white border-2 border-dashed rounded-xl text-center">
                    <Package className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">No travel data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {/* MAIN CARD */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 border-b">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {equipment.name}
                  </h1>

                  <p className="text-gray-600 mt-3">{equipment.description}</p>

                  <div className="inline-flex items-center gap-2 mt-4 bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-200">
                    <Truck className="w-4 h-4" />
                    {equipment.type}
                  </div>
                </div>

                {/* PRICING */}
                <div className="p-6 bg-indigo-50 border-b">
                  <div className="flex items-center gap-2 mb-2">
                    <IndianRupee className="w-6 h-6 text-blue-600" />
                    <span className="text-3xl font-bold text-gray-900">
                      {equipment.price}
                    </span>
                    <span className="text-gray-600">/day</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    + ₹{equipment.perKmRate || 150} per km travel
                  </p>
                </div>

                {/* SPECS */}
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Specifications
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <Detail label="Brand" value={equipment.brand} />
                    <Detail label="Model" value={equipment.model} />
                    <Detail label="Capacity" value={equipment.capacity} />
                    <Detail label="Year" value={equipment.year} />
                    <Detail label="Quantity" value={equipment.quantity} />
                  </div>
                </div>

                {/* BOOK BUTTON */}
                <div className="p-6">
                  <Link
                    href={`/equipments/${id}/book`}
                    className="block w-full text-center py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg"
                  >
                    Book This Equipment
                  </Link>
                </div>
              </div>

              {/* SUPPORT CARD */}
              <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl">
                <h4 className="font-bold mb-2">Need Help?</h4>
                <p className="text-gray-300 text-sm mb-4">
                  Available 24/7 to assist with bookings.
                </p>
                <button className="w-full bg-white text-gray-900 py-3 rounded-xl font-semibold">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
  REUSABLE DETAIL ROW
------------------------------------------------------------------- */
function Detail({ label, value }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg border">
      <p className="text-xs text-gray-500 uppercase">{label}</p>
      <p className="font-semibold text-gray-900">{value || "—"}</p>
    </div>
  );
}
