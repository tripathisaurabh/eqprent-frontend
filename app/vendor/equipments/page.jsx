"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Script from "next/script";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Search,
  MapPin,
  Navigation,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/apiConfig";

export default function VendorEquipments() {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);

  const mapRef = useRef(null);
  const markerRef = useRef(null);

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
    perKmRate: "150",
    baseLat: "",
    baseLng: "",
  });

  /* ---------------------------------------------------
     1️⃣ GOOGLE MAP INITIALIZER (100% working)
  ---------------------------------------------------- */
  const initMap = () => {
    if (!window.google || !window.google.maps) {
      console.log("⏳ Waiting for Google Maps...");
      setTimeout(initMap, 300);
      return;
    }

    const container = document.getElementById("equipmentMap");
    if (!container) return;

    const center = {
      lat: Number(formData.baseLat) || 19.0760,
      lng: Number(formData.baseLng) || 72.8777,
    };

    const map = new google.maps.Map(container, {
      center,
      zoom: 12,
      streetViewControl: false,
      mapTypeControl: false,
    });

    mapRef.current = map;

    const marker = new google.maps.Marker({
      map,
      position: center,
      draggable: true,
    });

    markerRef.current = marker;

    // update position on drag
    marker.addListener("dragend", (e) => {
      setFormData((prev) => ({
        ...prev,
        baseLat: e.latLng.lat(),
        baseLng: e.latLng.lng(),
      }));
    });

    // update on click
    map.addListener("click", (e) => {
      marker.setPosition(e.latLng);
      setFormData((prev) => ({
        ...prev,
        baseLat: e.latLng.lat(),
        baseLng: e.latLng.lng(),
      }));
    });
  };

  useEffect(() => {
    if (showAddForm && window.google?.maps) {
      setTimeout(initMap, 400);
    }
  }, [showAddForm]);

  /* ---------------------------------------------------
     2️⃣ FETCH VENDOR EQUIPMENTS
  ---------------------------------------------------- */
  const fetchEquipments = async () => {
    try {
      const vendorId = localStorage.getItem("userId");

      const res = await fetch(`${API_BASE_URL}/api/equipments?vendorId=${vendorId}`);
      const data = await res.json();

      const list = Array.isArray(data.items) ? data.items : [];
      setEquipments(list);
    } catch (err) {
      console.error("❌ Fetch vendor equipments:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  /* ---------------------------------------------------
     3️⃣ RESET FORM
  ---------------------------------------------------- */
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

  /* ---------------------------------------------------
     4️⃣ EDIT — LOAD DATA + OPEN MODAL
  ---------------------------------------------------- */
  const handleEdit = (eq) => {
    setEditingEquipment(eq);
    setFormData({
      name: eq.name,
      type: eq.type,
      brand: eq.brand,
      model: eq.model,
      capacity: eq.capacity,
      year: eq.year,
      quantity: eq.quantity,
      price: eq.price,
      description: eq.description,
      baseAddress: eq.baseAddress,
      baseLat: eq.baseLat,
      baseLng: eq.baseLng,
      perKmRate: eq.perKmRate || "150",
    });
    setShowAddForm(true);
  };

  /* ---------------------------------------------------
     5️⃣ CREATE / UPDATE EQUIPMENT
  ---------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const vendorId = localStorage.getItem("userId");

    const method = editingEquipment ? "PUT" : "POST";
    const url = editingEquipment
      ? `${API_BASE_URL}/api/equipments/${editingEquipment.id}`
      : `${API_BASE_URL}/api/equipments`;

    const fd = new FormData();
    Object.keys(formData).forEach((key) => fd.append(key, formData[key]));
    fd.append("vendorId", vendorId);

    const imagesInput = document.getElementById("equipmentImages");
    if (imagesInput?.files.length > 0) {
      Array.from(imagesInput.files).forEach((f) => fd.append("images", f));
    }

    const res = await fetch(url, { method, body: fd });
    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to save");
    } else {
      setMessage("Saved successfully!");
      fetchEquipments();
      resetForm();
    }

    setTimeout(() => setMessage(""), 2500);
    setSaving(false);
  };

  /* ---------------------------------------------------
     6️⃣ DELETE
  ---------------------------------------------------- */
  const handleDelete = async (id) => {
    if (!confirm("Delete this equipment?")) return;

    await fetch(`${API_BASE_URL}/api/equipments/${id}`, { method: "DELETE" });
    fetchEquipments();
  };

  /* ---------------------------------------------------
     UI STARTS HERE
  ---------------------------------------------------- */

  return (
    <>
      {/* LOAD GOOGLE MAPS SAFELY */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => console.log("✅ Google Maps Loaded")}
      />

      <div className="min-h-screen bg-gray-50 pt-28 pb-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">

          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900">
              Manage Equipment
            </h1>

            <button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Equipment
            </button>
          </motion.div>

          {/* SEARCH */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md"
            />
          </div>

          {/* MODAL — ADD / EDIT */}
          {showAddForm && (
            <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center overflow-y-auto">
              <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editingEquipment ? "Edit Equipment" : "Add Equipment"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* TEXT FIELDS */}
                  <input
                    required
                    type="text"
                    placeholder="Equipment Name"
                    className="w-full border p-2 rounded-md"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />

                  {/* TYPE */}
                  <select
                    required
                    className="w-full border p-2 rounded-md"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option>Select Type</option>
                    <option>Excavator</option>
                    <option>Crane</option>
                    <option>Loader</option>
                    <option>Concrete Mixer</option>
                    <option>Bulldozer</option>
                  </select>

                  {/* LOCATION PICKER */}
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1">
                      <MapPin className="h-4" />
                      Set Base Location
                    </label>

                    <button
                      type="button"
                      className="mt-2 mb-2 px-4 py-2 bg-green-600 text-white rounded-md flex items-center gap-2"
                      onClick={() => {
                        navigator.geolocation.getCurrentPosition((pos) => {
                          setFormData((p) => ({
                            ...p,
                            baseLat: pos.coords.latitude,
                            baseLng: pos.coords.longitude,
                          }));
                        });
                      }}
                    >
                      <Navigation className="h-4" />
                      Use My Location
                    </button>

                    {/* MAP */}
                    <div
                      id="equipmentMap"
                      className="w-full h-64 bg-gray-200 rounded-md"
                    ></div>
                  </div>

                  {/* IMAGES */}
                  <input
                    id="equipmentImages"
                    type="file"
                    multiple
                    className="border p-2 rounded-md w-full"
                    onChange={(e) =>
                      setImagePreviews(
                        Array.from(e.target.files).map((f) =>
                          URL.createObjectURL(f)
                        )
                      )
                    }
                  />

                  {imagePreviews.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {imagePreviews.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          className="h-16 w-16 rounded-md object-cover border"
                        />
                      ))}
                    </div>
                  )}

                  {/* BUTTONS */}
                  <div className="flex gap-3 mt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 rounded-md"
                    >
                      {saving
                        ? "Saving..."
                        : editingEquipment
                        ? "Update Equipment"
                        : "Add Equipment"}
                    </button>

                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-200 py-2 rounded-md"
                    >
                      Cancel
                    </button>
                  </div>

                  {message && (
                    <div className="text-green-600 mt-4 text-center">
                      {message}
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipments.map((eq) => (
              <div key={eq.id} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="h-40 bg-gray-200 rounded-md overflow-hidden mb-3">
                  {eq.images?.[0] ? (
                    <img
                      src={
                        eq.images[0].url.startsWith("http")
                          ? eq.images[0].url
                          : `${API_BASE_URL}${eq.images[0].url}`
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="mx-auto h-8 w-8 text-gray-400 mt-14" />
                  )}
                </div>

                <h3 className="font-bold">{eq.name}</h3>
                <p className="text-sm text-gray-500">{eq.type}</p>
                <p className="text-lg font-semibold text-blue-600">
                  ₹{eq.price}/day
                </p>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(eq)}
                    className="flex-1 border rounded-md py-1"
                  >
                    <Edit className="inline h-4 mr-1" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(eq.id)}
                    className="flex-1 border border-red-300 text-red-600 rounded-md py-1"
                  >
                    <Trash2 className="inline h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
