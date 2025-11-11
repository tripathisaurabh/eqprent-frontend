"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import TravelCostCalculator from "@/components/TravelCostCalculator";
import { MapPin, IndianRupee, Building2, Truck, ChevronLeft, ChevronRight, Calendar, Shield, Star, Phone, Mail, Package } from "lucide-react";
import ProductRecommendations from "@/components/ProductRecommendations";
import Navbar from "@/components/Navbar";
import { API_BASE_URL } from "@/lib/apiConfig";

export default function EquipmentDetailPage() {
  const { id } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE_URL}/api/equipments/${id}`)
      .then((res) => res.json())
      .then((data) => setEquipment(data))
      .catch((err) => console.error("Error fetching equipment:", err));
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

// ✅ Safe Normalizer
const normalizeImageUrl = (img) => {
  if (!img) return "/placeholder.jpg";

  // Case 1 — plain string
  if (typeof img === "string") {
    return img.startsWith("http")
      ? img
      : `${API_BASE_URL}${img.startsWith("/") ? img : "/" + img}`;
  }

  // Case 2 — object with url property
  if (typeof img === "object" && img.url) {
    if (typeof img.url === "string") {
      return img.url.startsWith("http")
        ? img.url
        : `${API_BASE_URL}${img.url.startsWith("/") ? img.url : "/" + img.url}`;
    }
    // Case 2b — nested object like { url: { path: "/uploads/x.jpg" } }
    if (typeof img.url === "object" && typeof img.url.path === "string") {
      const path = img.url.path;
      return `${API_BASE_URL}${path.startsWith("/") ? path : "/" + path}`;
    }
  }

  // Fallback
  return "/placeholder.jpg";
};

// ✅ Use this safely
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
        {/* Breadcrumb Navigation */}
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
          {/* Left Column - Images & Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* Premium Image Gallery Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="relative group">
                <img
                  src={images[activeImage]}
                  alt={equipment.name}
                  className="w-full h-[500px] object-cover"
                  onError={(e) => (e.target.src = "/placeholder.jpg")}
                />

                {/* Image Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => handleImageNav("prev")}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-800" />
                    </button>
                    <button
                      onClick={() => handleImageNav("next")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-800" />
                    </button>
                  </>
                )}

                {/* Image Counter Badge */}
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                  {activeImage + 1} / {images.length}
                </div>

                {/* Verified Badge */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                  <Shield className="w-4 h-4" />
                  Verified
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-3 transition-all duration-300 ${activeImage === index
                          ? "border-blue-600 ring-4 ring-blue-200 scale-105"
                          : "border-gray-200 hover:border-blue-400 hover:scale-105"
                        }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target.src = "/placeholder.jpg")}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Location & Travel Cost Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">


      

              {/* Travel Cost Calculator Section */}
              <div className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                  <Truck className="w-5 h-5 text-blue-600" />
                  Estimate Your Travel Cost
                </h4>
                {equipment.baseLat && equipment.baseLng ? (
                  <TravelCostCalculator
                    baseLat={equipment.baseLat}
                    baseLng={equipment.baseLng}
                    perKmRate={equipment.perKmRate}
                  />
                ) : (
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border-2 border-dashed border-gray-300 text-center">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600 font-medium">
                      Travel cost estimation not available for this equipment.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Contact vendor for delivery details
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Right Column - Product Details & Booking */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {/* Main Product Info Card */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                      {equipment.name}
                    </h1>
                    <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-1 rounded-full border border-yellow-200">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-gray-900">4.8</span>
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-6 break-words">
                    {equipment.description || "No description provided."}
                  </p>

                  {/* Equipment Type Badge */}
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-200 mb-6">
                    <Truck className="w-4 h-4" />
                    <span className="font-semibold text-sm">{equipment.type}</span>
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-100">
                  <div className="flex items-baseline gap-2 mb-3">
                    <IndianRupee className="w-8 h-8 text-blue-600 mt-1" />
                    <span className="text-4xl font-bold text-gray-900">{equipment.price}</span>
                    <span className="text-lg text-gray-600 font-medium">/day</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <Truck className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">
                      + <span className="font-semibold text-green-600">₹{equipment.perKmRate || 150}</span> per km for travel
                    </span>
                  </div>
                </div>

                {/* Equipment Details Grid */}
{/* Equipment Specifications Section */}
<div className="p-6 space-y-6 border-t border-gray-100">
  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
    <Package className="w-5 h-5 text-blue-600" />
    Equipment Specifications
  </h3>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <Detail label="Brand" value={equipment.brand} />
    <Detail label="Model" value={equipment.model} />
    <Detail label="Capacity" value={equipment.capacity} />
    <Detail label="Year of Manufacture" value={equipment.year} />
    <Detail label="Quantity Available" value={equipment.quantity} />
    {/* <Detail label="Per Km Rate" value={`₹${equipment.perKmRate || 150}`} /> */}
    {/* <Detail label="Pincode" value={equipment.pincode} />
    <Detail label="Landmark" value={equipment.landmark} />
    <Detail label="Base Address" value={equipment.baseAddress} />
    <Detail label="Latitude" value={equipment.baseLat} />
    <Detail label="Longitude" value={equipment.baseLng} /> */}
  </div>
</div>


                {/* CTA Button */}
                <div className="p-6 pt-0">
                  <Link
                    href={`/equipments/${id}/book`}
                    className="block w-full text-center py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  >
                    Book This Equipment Now
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="p-6 pt-0 flex items-center justify-around text-center border-t border-gray-100">
                  <div className="group cursor-pointer">
                    <Shield className="w-6 h-6 text-green-600 mx-auto mb-1 group-hover:scale-110 transition" />
                    <p className="text-xs text-gray-600 font-medium">Verified</p>
                  </div>
                  <div className="group cursor-pointer">
                    <Truck className="w-6 h-6 text-blue-600 mx-auto mb-1 group-hover:scale-110 transition" />
                    <p className="text-xs text-gray-600 font-medium">Fast Delivery</p>
                  </div>
                  <div className="group cursor-pointer">
                    <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-1 group-hover:scale-110 transition" />
                    <p className="text-xs text-gray-600 font-medium">Flexible</p>
                  </div>
                </div>
              </div>

              {/* Help Card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl p-6 text-white">
                <h4 className="font-bold mb-2 text-lg">Need Assistance?</h4>
                <p className="text-gray-300 text-sm mb-4">
                  Our team is available 24/7 to help you with your equipment rental needs.
                </p>
                <button className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg">
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
// ✅ Reusable mini detail component
function Detail({ label, value }) {
  return (
    <div className="flex flex-col bg-gray-50 hover:bg-gray-100 p-3 rounded-lg border border-gray-100 transition">
      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
        {label}
      </p>
      <p className="font-medium text-gray-900 break-words">
        {value || "Not specified"}
      </p>
    </div>
  );
}
