"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Package, Search, MapPin, Navigation } from "lucide-react";
import { API_BASE_URL } from "@/lib/apiConfig";
import "leaflet/dist/leaflet.css";

/* --------------------------------------------
   GOOGLE MAPS LOADER
-------------------------------------------- */
const loadGoogleMaps = () => {
  if (typeof window === "undefined") return;
  if (window.google && window.google.maps) return;

  const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
  if (existing) return;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
};

/* --------------------------------------------
   MAIN COMPONENT
-------------------------------------------- */
export default function VendorEquipments() {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);

  /* MAP */
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  /* FORM DATA */
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
    baseAddress: "",
    perKmRate: "150",
    baseLat: "",
    baseLng: "",
  });

  /* --------------------------------------------
     LOAD MAP SCRIPT
  -------------------------------------------- */
  useEffect(() => loadGoogleMaps(), []);

  /* --------------------------------------------
     INITIALISE MAP WHEN MODAL OPENS
  -------------------------------------------- */
  const initMap = () => {
    if (!showAddForm) return;
    if (!window.google?.maps) return;
    if (mapRef.current) return;

    const container = document.getElementById("equipmentMap");
    if (!container) return;

    const center = {
      lat: parseFloat(formData.baseLat) || 19.076,
      lng: parseFloat(formData.baseLng) || 72.8777,
    };

    const map = new window.google.maps.Map(container, {
      center,
      zoom: 12,
    });

    mapRef.current = map;

    const marker = new window.google.maps.Marker({
      position: center,
      map,
      draggable: true,
    });

    markerRef.current = marker;

    const updatePos = (lat, lng) => {
      setFormData((prev) => ({ ...prev, baseLat: lat, baseLng: lng }));
    };

    marker.addListener("dragend", (e) => updatePos(e.latLng.lat(), e.latLng.lng()));
    map.addListener("click", (e) => updatePos(e.latLng.lat(), e.latLng.lng()));
  };

  useEffect(() => {
    if (showAddForm) setTimeout(initMap, 400);
    else {
      mapRef.current = null;
      markerRef.current = null;
    }
  }, [showAddForm]);

  /* --------------------------------------------
     FETCH VENDOR EQUIPMENTS
  -------------------------------------------- */
  const fetchEquipments = async () => {
    try {
      const vendorId = localStorage.getItem("userId");
      if (!vendorId) return;

      const res = await fetch(`${API_BASE_URL}/api/equipments?vendorId=${vendorId}`);
      const data = await res.json();

      const list =
        Array.isArray(data.items) ? data.items :
        Array.isArray(data.equipments) ? data.equipments :
        Array.isArray(data) ? data : [];

      setEquipments(list);
    } catch (err) {
      console.error("❌ Fetch vendor equipments:", err);
      setEquipments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => fetchEquipments(), []);

  /* --------------------------------------------
     EDIT MODE
  -------------------------------------------- */
  const handleEdit = (eq) => {
    setEditingEquipment(eq);

    setFormData({
      name: eq.name || "",
      type: eq.type || "",
      brand: eq.brand || "",
      model: eq.model || "",
      capacity: eq.capacity || "",
      year: eq.year ?? "",
      quantity: eq.quantity ?? "",
      price: eq.price ?? "",
      description: eq.description || "",
      baseAddress: eq.baseAddress || "",
      perKmRate: eq.perKmRate?.toString() ?? "150",
      baseLat: eq.baseLat?.toString() ?? "",
      baseLng: eq.baseLng?.toString() ?? "",
    });

    setImagePreviews(eq.images?.map((img) => img.url) || []);
    setShowAddForm(true);
  };

  /* --------------------------------------------
     DELETE
  -------------------------------------------- */
  const handleDelete = async (id) => {
    if (!confirm("Delete this equipment?")) return;

    const res = await fetch(`${API_BASE_URL}/api/equipments/${id}`, {
      method: "DELETE",
    });

    if (res.ok) fetchEquipments();
    else console.error("❌ Delete failed");
  };

  /* --------------------------------------------
     CREATE / UPDATE SUBMIT
  -------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const vendorId = localStorage.getItem("userId");
    const method = editingEquipment ? "PUT" : "POST";

    const url = editingEquipment
      ? `${API_BASE_URL}/api/equipments/${editingEquipment.id}`
      : `${API_BASE_URL}/api/equipments`; // FIXED

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([k, v]) => formDataToSend.append(k, v));
    formDataToSend.append("vendorId", vendorId);

    const input = document.getElementById("equipmentImages");
    if (input?.files.length) {
      [...input.files].forEach((file) => formDataToSend.append("images", file));
    }

    const res = await fetch(url, { method, body: formDataToSend });
    const result = await res.json();

    if (res.ok) {
      setMessage("Saved successfully!");
      fetchEquipments();
      resetForm();
    } else {
      alert(result.message || "Failed");
    }

    setSaving(false);
  };

  const resetForm = () => {
    setEditingEquipment(null);
    setShowAddForm(false);
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
      baseAddress: "",
      perKmRate: "150",
      baseLat: "",
      baseLng: "",
    });
    setImagePreviews([]);
  };

  /* --------------------------------------------
     FILTER
  -------------------------------------------- */
  const filteredEquipments = equipments.filter((eq) =>
    (eq.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* --------------------------------------------
     RENDER
  -------------------------------------------- */

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-10 px-4">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Equipment</h1>

          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="bg-blue-600 text-white px-5 py-2 rounded-md flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Equipment
          </button>
        </div>

        {/* SEARCH */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md"
          />
        </div>

        {/* EQUIPMENT LIST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipments.map((eq) => (
            <div key={eq.id} className="bg-white p-4 rounded-lg shadow border">

              <div className="h-40 bg-gray-100 rounded overflow-hidden">
                {eq.images?.[0]?.url ? (
                  <img
                    src={eq.images[0].url.startsWith("http")
                      ? eq.images[0].url
                      : `${API_BASE_URL}${eq.images[0].url}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-10 h-10 mx-auto mt-14 text-gray-300" />
                )}
              </div>

              <h3 className="font-semibold text-lg mt-3">{eq.name}</h3>
              <p className="text-sm">{eq.type}</p>
              <p className="font-bold text-blue-600">₹{eq.price}/day</p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEdit(eq)}
                  className="flex-1 border rounded py-1"
                >
                  <Edit className="inline w-4 h-4 mr-1" /> Edit
                </button>

                <button
                  onClick={() => handleDelete(eq.id)}
                  className="flex-1 border border-red-400 text-red-600 rounded py-1"
                >
                  <Trash2 className="inline w-4 h-4 mr-1" /> Delete
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* MODAL */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-2xl rounded-xl overflow-y-auto max-h-[90vh] p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingEquipment ? "Edit Equipment" : "Add Equipment"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">

                <input
                  type="text"
                  placeholder="Name"
                  className="w-full border p-2 rounded"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <select
                  className="w-full border p-2 rounded"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="">Select Type</option>
                  <option>Crane</option>
                  <option>Excavator</option>
                  <option>Loader</option>
                  <option>Bulldozer</option>
                </select>

                <input
                  type="file"
                  id="equipmentImages"
                  multiple
                  className="border p-2 w-full"
                  onChange={(e) => {
                    const files = [...e.target.files];
                    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
                  }}
                />

                {/* IMAGE PREVIEW */}
                <div className="flex gap-2 flex-wrap">
                  {imagePreviews.map((src, i) => (
                    <img key={i} src={src} className="w-16 h-16 rounded object-cover border" />
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded"
                >
                  {editingEquipment ? "Update" : "Add"} Equipment
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full bg-gray-200 py-2 rounded"
                >
                  Cancel
                </button>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
