"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Package, Search, MapPin, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { API_BASE_URL } from "@/lib/apiConfig";

// Leaflet components
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
import L from "leaflet";

const icon = new L.Icon({
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function VendorEquipments() {
  /* ------------------ STATE ------------------ */
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  /* ------------------ FORM DATA ------------------ */
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
    baseLat: "19.076",
    baseLng: "72.8777",
  });

  /* ------------------ AUTOCOMPLETE (OpenStreetMap) ------------------ */
  const handleSearchInput = async (value: string) => {
    setFormData((p) => ({ ...p, baseAddress: value }));
    if (value.length < 3) return setSuggestions([]);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${value}`;
    const res = await fetch(url);
    const data = await res.json();
    setSuggestions(data);
  };

  /* ------------------ SELECT SUGGESTION ------------------ */
  const selectSuggestion = (place: any) => {
    setSuggestions([]);
    setFormData({
      ...formData,
      baseAddress: place.display_name,
      baseLat: place.lat,
      baseLng: place.lon,
    });
  };

  /* ------------------ Fetch Vendor Equipments ------------------ */
  const fetchEquipments = async () => {
    try {
      const vendorId = localStorage.getItem("userId");
      const res = await fetch(`${API_BASE_URL}/api/equipments?vendorId=${vendorId}`);
      const data = await res.json();
      setEquipments(data.items || []);
    } catch (e) {
      console.error("❌ Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  /* ------------------ Image Preview ------------------ */
  const handleImageChange = (e: any) => {
    const files = Array.from(e.target.files);
    setImagePreviews(files.map((f: any) => URL.createObjectURL(f)));
  };

  /* ------------------ Save Equipment ------------------ */
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);

    try {
      const vendorId = localStorage.getItem("userId");
      const method = editingEquipment ? "PUT" : "POST";
      const url = editingEquipment
        ? `${API_BASE_URL}/api/equipments/${editingEquipment.id}`
        : `${API_BASE_URL}/api/equipments`;

      const fd = new FormData();
      Object.keys(formData).forEach((key) => fd.append(key, formData[key]));
      fd.append("vendorId", vendorId);

      const imgInput = document.getElementById("equipmentImages");
      if (imgInput?.files.length) {
        for (const f of imgInput.files) fd.append("images", f);
      }

      const res = await fetch(url, { method, body: fd });
      const result = await res.json();

      if (res.ok) {
        setMessage("✅ Saved successfully!");
        fetchEquipments();
        resetForm();
      } else {
        alert("Failed to save");
      }
    } catch (err) {
      console.error("❌ Save error:", err);
    }

    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  /* ------------------ Delete Equipment ------------------ */
  const handleDelete = async (id: number) => {
    if (!confirm("Delete equipment?")) return;

    await fetch(`${API_BASE_URL}/api/equipments/${id}`, { method: "DELETE" });
    fetchEquipments();
  };

  /* ------------------ Reset Form ------------------ */
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
      baseAddress: "",
      perKmRate: "150",
      baseLat: "19.076",
      baseLng: "72.8777",
    });
  };

  /* ------------------ UI ------------------ */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Equipments</h1>
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="mr-2 h-5 w-5" /> Add Equipment
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md"
          />
        </div>

        {/* MODAL */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl p-6 max-h-[90vh] overflow-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingEquipment ? "Edit Equipment" : "Add Equipment"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* BASIC INFO */}
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Equipment Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                {/* LOCATION SEARCH */}
                <div>
                  <input
                    className="w-full border p-2 rounded"
                    placeholder="Search location..."
                    value={formData.baseAddress}
                    onChange={(e) => handleSearchInput(e.target.value)}
                  />

                  {suggestions.length > 0 && (
                    <div className="border bg-white shadow rounded mt-1 max-h-60 overflow-auto">
                      {suggestions.map((s: any) => (
                        <div
                          key={s.place_id}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => selectSuggestion(s)}
                        >
                          {s.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* MAP */}
                <MapContainer
                  center={[parseFloat(formData.baseLat), parseFloat(formData.baseLng)]}
                  zoom={13}
                  scrollWheelZoom={true}
                  className="w-full h-64 rounded border"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                  <Marker
                    icon={icon}
                    draggable={true}
                    position={[parseFloat(formData.baseLat), parseFloat(formData.baseLng)]}
                    eventHandlers={{
                      dragend: (e) => {
                        const lat = e.target.getLatLng().lat;
                        const lng = e.target.getLatLng().lng;
                        setFormData({ ...formData, baseLat: lat, baseLng: lng });
                      },
                    }}
                  />
                </MapContainer>

                {/* IMAGE UPLOAD */}
                <input id="equipmentImages" type="file" multiple onChange={handleImageChange} />

                {/* BUTTONS */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 rounded">
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EQUIPMENT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {equipments.map((eq) => (
            <div key={eq.id} className="bg-white p-4 rounded shadow border">
              <h3 className="font-bold">{eq.name}</h3>
              <p className="text-sm">{eq.type}</p>
              <p className="text-xs text-gray-500">Location: {eq.baseAddress}</p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEdit(eq)}
                  className="flex-1 border p-1 rounded text-sm"
                >
                  <Edit className="inline w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(eq.id)}
                  className="flex-1 border border-red-400 text-red-600 p-1 rounded text-sm"
                >
                  <Trash2 className="inline w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
