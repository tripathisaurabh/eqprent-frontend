"use client";
import { useState, useEffect, useRef } from "react";
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
import { API_BASE_URL } from "@/lib/apiConfig";

/* ------------------------------------
   LOAD GOOGLE MAPS SCRIPT (SAFE)
------------------------------------- */
const loadGoogleMaps = () => {
  if (typeof window === "undefined") return;
  if (window.google && window.google.maps) return;

  const scriptExists = document.querySelector(
    'script[src*="maps.googleapis.com/maps/api/js"]'
  );
  if (scriptExists) return;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
};

export default function VendorEquipments() {
  /* ------------------------------------
     STATE
  ------------------------------------- */
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);

  /* MAP REFS */
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  /* FORM DATA */
  const [form, setForm] = useState({
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
    pincode: "",
    landmark: "",
    perKmRate: "150",
    baseLat: "",
    baseLng: "",
  });

  /* ------------------------------------
     SAFE FETCH — vendor only
  ------------------------------------- */
  const fetchEquipments = async () => {
    try {
      const vendorId = localStorage.getItem("userId");
      if (!vendorId) return setEquipments([]);

      const res = await fetch(
        `${API_BASE_URL}/api/equipments?vendorId=${vendorId}`
      );

      const data = await res.json();
      console.log("🟢 Vendor Equipments API:", data);

      const list =
        Array.isArray(data.equipments)
          ? data.equipments
          : Array.isArray(data.items)
          ? data.items
          : [];

      setEquipments(list);
    } catch (e) {
      console.error("❌ Fetch vendor equipments error:", e);
      setEquipments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoogleMaps();
    fetchEquipments();
  }, []);

  /* ------------------------------------
     EDIT HANDLER
  ------------------------------------- */
  const handleEdit = (eq) => {
    setEditing(eq);

    setForm({
      name: eq.name || "",
      type: eq.type || "",
      brand: eq.brand || "",
      model: eq.model || "",
      capacity: eq.capacity || "",
      year: eq.year ?? "",
      quantity: eq.quantity ?? "",
      price: eq.price ?? "",
      description: eq.description || "",
      pincode: eq.pincode ?? "",
      landmark: eq.landmark ?? "",
      baseAddress: eq.baseAddress || "",
      perKmRate: eq.perKmRate?.toString() ?? "150",
      baseLat: eq.baseLat?.toString() ?? "",
      baseLng: eq.baseLng?.toString() ?? "",
    });

    setShowForm(true);
  };

  /* ------------------------------------
     CLEAN RESET
  ------------------------------------- */
  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setImagePreviews([]);
    setForm({
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

  /* ------------------------------------
     ADD / UPDATE HANDLER
  ------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const vendorId = localStorage.getItem("userId");

      const url = editing
        ? `${API_BASE_URL}/api/equipments/${editing.id}`
        : `${API_BASE_URL}/api/equipments`;

      const method = editing ? "PUT" : "POST";

      const fd = new FormData();
      Object.keys(form).forEach((k) => fd.append(k, form[k]));
      fd.append("vendorId", vendorId);

      const input = document.getElementById("equipmentImages");
      if (input?.files.length) {
        Array.from(input.files).forEach((f) => fd.append("images", f));
      }

      const res = await fetch(url, { method, body: fd });
      const result = await res.json();

      if (res.ok) {
        setMessage("✅ Saved successfully!");
        fetchEquipments();
        resetForm();
      } else {
        alert(result.message || "Failed to save equipment.");
      }
    } catch (err) {
      console.error("❌ Save error:", err);
    }

    setSaving(false);
    setTimeout(() => setMessage(""), 2500);
  };

  /* ------------------------------------
     DELETE EQUIPMENT
  ------------------------------------- */
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/equipments/${id}`, {
        method: "DELETE",
      });

      if (res.ok) fetchEquipments();
    } catch (err) {
      console.error("❌ Delete error:", err);
    }
  };

  /* ------------------------------------
     SAFE IMAGE URL BUILDER
  ------------------------------------- */
  const getImage = (imgObj) => {
    try {
      const url = imgObj?.url;
      if (!url) return null;
      if (typeof url !== "string") return null;
      if (url.startsWith("http")) return url;

      return `${API_BASE_URL}${url}`;
    } catch {
      return null;
    }
  };

  /* ------------------------------------
     UI
  ------------------------------------- */

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-10 px-4 sm:px-6">
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
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center"
          >
            <Plus className="mr-2 h-5 w-5" /> Add Equipment
          </button>
        </motion.div>

        {/* SEARCH BAR */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search equipment..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipments.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10">
              No equipment found.
            </div>
          ) : (
            equipments
              .filter(
                (eq) =>
                  eq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  eq.type?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((eq) => (
                <div key={eq.id} className="bg-white p-4 rounded-lg border">
                  <div className="h-40 bg-gray-100 rounded-md overflow-hidden mb-3">
                    {eq.images?.length > 0 ? (
                      <img
                        src={getImage(eq.images[0])}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-10 w-10 text-gray-400 mx-auto mt-14" />
                    )}
                  </div>

                  <p className="text-xs text-gray-500">ID: {eq.id}</p>
                  <h3 className="text-lg font-semibold">{eq.name}</h3>
                  <p className="text-gray-600">{eq.type}</p>
                  <p className="text-blue-600 font-bold">₹{eq.price}/day</p>
                  <p className="text-sm text-gray-500">
                    Location: {eq.baseAddress || "Not set"}
                  </p>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(eq)}
                      className="flex-1 border rounded-md py-1 text-sm"
                    >
                      <Edit className="inline w-4 h-4 mr-1" /> Edit
                    </button>

                    <button
                      onClick={() => handleDelete(eq.id)}
                      className="flex-1 border border-red-300 text-red-600 rounded-md py-1 text-sm"
                    >
                      <Trash2 className="inline w-4 h-4 mr-1" /> Delete
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* FORM MODAL */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center overflow-auto">
            <div className="bg-white w-full max-w-xl p-6 rounded-xl shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {editing ? "Edit Equipment" : "Add Equipment"}
                </h2>
                <button onClick={resetForm}>✕</button>
              </div>

              {message && (
                <div className="p-2 bg-blue-50 text-blue-700 text-center rounded">
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* FORM FIELDS */}
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full border p-2 rounded"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />

                <select
                  className="w-full border p-2 rounded"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option>Select Type</option>
                  <option>Excavator</option>
                  <option>Crane</option>
                  <option>Loader</option>
                  <option>Concrete Mixer</option>
                  <option>Bulldozer</option>
                  <option>Other</option>
                </select>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Brand"
                    className="border p-2 rounded"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  />

                  <input
                    type="text"
                    placeholder="Model"
                    className="border p-2 rounded"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                  />
                </div>

                <input
                  type="number"
                  placeholder="Price/day"
                  className="w-full border p-2 rounded"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />

                {/* Images */}
                <input
                  id="equipmentImages"
                  type="file"
                  multiple
                  className="w-full border p-2 rounded"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
                  }}
                />

                {imagePreviews.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {imagePreviews.map((src, i) => (
                      <img
                        src={src}
                        key={i}
                        className="w-16 h-16 border rounded object-cover"
                      />
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 text-white py-2 rounded mt-2"
                >
                  {saving ? "Saving..." : editing ? "Update" : "Add"} Equipment
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
