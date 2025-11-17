"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import TravelCostCalculator from "@/components/TravelCostCalculator";
import {
  MapPin,
  IndianRupee,
  Building2,
  Truck,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Shield,
  Star,
  Phone,
  Mail,
  Package
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductRecommendations from "@/components/ProductRecommendations";

import { apiFetch } from "@/lib/apiConfig"; // ✅ USE API WRAPPER
import { API_BASE_URL } from "@/lib/apiConfig"; // for images

export default function EquipmentDetailPage() {
  const { id } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  // --------------------------------------------
  // ⭐ 1. FETCH EQUIPMENT SAFELY (NO LOCALHOST)
  // --------------------------------------------
  useEffect(() => {
    if (!id) return;

    apiFetch(`/api/equipments/${id}`)
      .then((data) => {
        console.log("Equipment Data Loaded:", data);
        setEquipment(data);
      })
      .catch((err) => console.error("❌ Error fetching equipment:", err));
  }, [id]);

  if (!equipment)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading equipment details...</p>
        </div>
      </div>
    );

  // --------------------------------------------
  // ⭐ 2. SAFE IMAGE NORMALIZER
  // --------------------------------------------
  const normalizeImageUrl = (img) => {
    if (!img) return "/placeholder.jpg";

    // Case 1 — plain string
    if (typeof img === "string") {
      return img.startsWith("http")
        ? img
        : `${API_BASE_URL}${img.startsWith("/") ? img : "/" + img}`;
    }

    // Case 2 — object with url
    if (typeof img === "object" && img.url) {
      if (typeof img.url === "string") {
        return img.url.startsWith("http")
          ? img.url
          : `${API_BASE_URL}${img.url.startsWith("/") ? img.url : "/" + img.url}`;
      }

      // Case 2b — nested like { url: { path: "/uploads/x.jpg" } }
      if (typeof img.url === "object" && typeof img.url.path === "string") {
        const path = img.url.path;
        return `${API_BASE_URL}${path.startsWith("/") ? path : "/" + path}`;
      }
    }

    return "/placeholder.jpg";
  };

  // ⭐ Build image array
  const images = Array.isArray(equipment.images)
    ? equipment.images.map((img) => normalizeImageUrl(img))
    : ["/placeholder.jpg"];

  const handleImageNav = (direction) => {
    if (direction === "next") {
      setActiveImage((prev) => (prev + 1) % images.length);
    } else {
      setActiveImage((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition">Home</Link>
          <span>/</span>
          <Link href="/equipments" className="hover:text-blue-600 transition">Equipment</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{equipment.type}</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="relative group">
                <img
                  src={images[activeImage]}
                  alt={equipment.name}
                  className="w-full h-[500px] object-cover"
                  onError={(e) => (e.target.src = "/placeholder.jpg")}
                />

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => handleImageNav("prev")}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-800" />
                    </button>

                    <button
                      onClick={() => handleImageNav("next")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"
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
                <div className="absolute top-4 left-4 bg-green-600 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg">
                  <Shield className="w-4 h-4" />
                  Verified
                </div>
              </div>

              {/* Thumbnail Row */}
              {images.length > 1 && (
                <div className="flex gap-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`w-24 h-24 rounded-xl overflow-hidden border-2 ${
                        activeImage === index
                          ? "border-blue-600 ring-4 ring-blue-200"
                          : "border-gray-200 hover:border-blue-400"
                      }`}
                    >
                      <img
                        src={img}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target.src = "/placeholder.jpg")}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Travel Cost Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-6 bg-blue-50">
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
                <p className="text-gray-600">Travel cost data unavailable.</p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {/* INFO CARD */}
              <div className="bg-white rounded-2xl shadow-xl">
                <div className="p-6 border-b border-gray-200">
                  <h1 className="text-2xl font-bold text-gray-900">{equipment.name}</h1>

                  <p className="mt-4 text-gray-700">{equipment.description}</p>
                </div>

                {/* PRICE */}
                <div className="p-6 bg-blue-50 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-6 h-6 text-blue-600" />
                    <span className="text-4xl font-bold text-gray-900">{equipment.price}</span>
                    <span className="text-gray-600">/day</span>
                  </div>
                </div>

                {/* SPECS */}
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-4">Specifications</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <Detail label="Brand" value={equipment.brand} />
                    <Detail label="Model" value={equipment.model} />
                    <Detail label="Capacity" value={equipment.capacity} />
                    <Detail label="Year" value={equipment.year} />
                    <Detail label="Quantity" value={equipment.quantity} />
                  </div>
                </div>

                {/* CTA */}
                <div className="p-6">
                  <Link
                    href={`/equipments/${id}/book`}
                    className="block text-center py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                  >
                    Book This Equipment Now
                  </Link>
                </div>
              </div>

              {/* HELP CARD */}
              <div className="bg-gray-900 text-white rounded-2xl p-6">
                <h4 className="font-bold mb-2">Need Help?</h4>
                <p className="text-gray-300 mb-4">We are available 24/7.</p>
                <button className="w-full py-3 bg-white text-gray-900 rounded-xl font-semibold">
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

function Detail({ label, value }) {
  return (
    <div className="flex flex-col bg-gray-50 p-3 rounded-lg border">
      <p className="text-xs text-gray-500 uppercase">{label}</p>
      <p className="font-medium text-gray-900">{value || "Not specified"}</p>
    </div>
  );
}
