"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Search,
  MapPin,
  Navigation,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import { API_BASE_URL } from "@/lib/apiConfig";

// Leaflet (SSR Safe)
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });

export default function VendorEquipments() {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // FORM DATA
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    brand: "",
    model: "",
    capacity: "",
    year: "",
    quantity: "",
    price: "",
    description: "",
    pincode: "",
    landmark: "",
    baseAddress: "",
    perKmRate: "101",
    baseLat: "",
    baseLng: "",
  });

  // ------------------------------- FIX 1 — CLEAN FETCH -------------------------------
  // 🧠 Fetch equipments – ONLY this vendor
const fetchEquipments = async () => {
  try {
    const vendorId = localStorage.getItem("userId");
    if (!vendorId) {
      console.warn("No vendorId in localStorage");
      setEquipments([]);
      setLoading(false);
      return;
    }

    const res = await fetch(
      `${API_BASE_URL}/api/equipments/vendor?vendorId=${vendorId}`,
      { cache: "no-store" }
    );

    const data = await res.json();
    console.log("🟢 Vendor Equipments API response:", data);

    // backend: { success: true, equipments: [...] }
    setEquipments(Array.isArray(data.equipments) ? data.equipments : []);
  } catch (e) {
    console.error("❌ Fetch vendor equipments error:", e);
    setEquipments([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchEquipments();
  }, []);

  // ------------------------------- IMAGE PREVIEW -------------------------------
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  // ------------------------------- FIX 2 — IMAGE URL NORMALIZATION -------------------------------
  const getImageUrl = (imageObj) => {
    if (!imageObj || !imageObj.url) return null;

    const url = imageObj.url;

    // Supabase public URL → use directly
    if (url.startsWith("http")) return url;

    // local uploads
    return `${API_BASE_URL}${url.startsWith("/") ? url : "/" + url}`;
  };

  // ------------------------------- DELETE -------------------------------
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/equipments/${id}`, { method: "DELETE" });
      if (res.ok) fetchEquipments();
    } catch (err) {
      console.error("❌ Delete error:", err);
    }
  };

  // ------------------------------- SUBMIT -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const vendorId = localStorage.getItem("userId");
      const method = editingEquipment ? "PUT" : "POST";
      const url = editingEquipment
        ? `${API_BASE_URL}/api/equipments/${editingEquipment.id}`
        : `${API_BASE_URL}/api/equipments`;

      const formDataToSend = new FormData();
      for (const key in formData) {
        formDataToSend.append(key, formData[key]);
      }
      formDataToSend.append("vendorId", vendorId);

      const input = document.getElementById("equipmentImages");
      if (input?.files.length) {
        Array.from(input.files).forEach((file) =>
          formDataToSend.append("images", file)
        );
      }

      const res = await fetch(url, { method, body: formDataToSend });
      const result = await res.json();

      if (res.ok) {
        setMessage("✅ Equipment saved successfully!");
        fetchEquipments();
        resetForm();
      } else {
        alert(result.error || "Failed to save");
      }
    } catch (err) {
      console.error("❌ Save error:", err);
    }

    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const resetForm = () => {
    setEditingEquipment(null);
    setShowAddForm(false);
    setImagePreviews([]);

    setFormData({
      name: "",
      type: "",
      brand: "",
      model: "",
      capacity: "",
      year: "",
      quantity: "",
      price: "",
      description: "",
      pincode: "",
      landmark: "",
      baseAddress: "",
      perKmRate: "150",
      baseLat: "",
      baseLng: "",
    });
  };

  // ------------------------------- FILTERING -------------------------------
  const filteredEquipments = equipments.filter((eq) => {
    const search = searchTerm.toLowerCase();
    return (
      eq.name?.toLowerCase().includes(search) ||
      eq.type?.toLowerCase().includes(search)
    );
  });

  // ------------------------------- UI -------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading equipments...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-10 px-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Manage Equipment</h1>

          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="mr-2 h-5 w-5" /> Add Equipment
          </button>
        </motion.div>

        {/* SEARCH */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* EQUIPMENT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredEquipments.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10">
              <Package className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              No equipments added yet.
            </div>
          ) : (
            filteredEquipments.map((eq) => (
              <div
                key={eq.id}
                className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition"
              >
                <div className="h-40 bg-gray-100 rounded-md overflow-hidden mb-3">
                  {eq?.images?.length > 0 ? (
                    <img
                      src={getImageUrl(eq.images[0])}
                      alt={eq.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-10 w-10 text-gray-400 mx-auto mt-14" />
                  )}
                </div>

                <span className="font-semibold">Equipment ID: </span> {eq.id}
                <h3 className="font-semibold text-lg text-gray-900">{eq.name}</h3>
                <p className="text-sm text-gray-600">{eq.type}</p>
                <p className="text-blue-600 font-bold">₹{eq.price}/day</p>

                <p className="text-sm text-gray-500 mt-1">
                  Location: {eq.baseAddress || "Not set"}
                </p>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setEditingEquipment(eq) || setShowAddForm(true)}
                    className="flex-1 border border-gray-300 rounded-md py-1 text-sm hover:bg-gray-50"
                  >
                    <Edit className="inline h-4 w-4 mr-1" /> Edit
                  </button>

                  <button
                    onClick={() => handleDelete(eq.id)}
                    className="flex-1 border border-red-300 text-red-600 rounded-md py-1 text-sm hover:bg-red-50"
                  >
                    <Trash2 className="inline h-4 w-4 mr-1" /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
