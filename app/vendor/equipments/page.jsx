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

// ✅ Safe Leaflet imports (optional, SSR-proof)
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

export default function VendorEquipments() {
  /* ------------------ State ------------------ */
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  /* ------------------ Map refs ------------------ */
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

  /* ------------------ Edit handler ------------------ */
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
      pincode: eq.pincode ?? "",
      landmark: eq.landmark ?? "",
      baseAddress: eq.baseAddress || "",
      perKmRate: eq.perKmRate?.toString() ?? "150",
      baseLat: eq.baseLat?.toString() ?? "",
      baseLng: eq.baseLng?.toString() ?? "",
    });

    setShowAddForm(true);
  };

  /* ------------------ Load Google Maps script ------------------ */
  // useEffect(() => {
  //   if (typeof window === "undefined") return;
  //   if (window.google && window.google.maps) return;

  //   const existing = document.querySelector(
  //     'script[src*="maps.googleapis.com/maps/api/js"]'
  //   );
  //   if (existing) return;

  //   const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  //   const script = document.createElement("script");
  //   script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  //   script.async = true;
  //   script.defer = true;
  //   document.head.appendChild(script);
  // }, []);

  /* ------------------ Init map safely ------------------ */
  const initMap = () => {
    if (!showAddForm) return;
    const mapContainer = document.getElementById("equipmentMap");
    if (!mapContainer || mapRef.current) return;
    if (!window.google || !window.google.maps) return;

    try {
      const defaultCenter = {
        lat: parseFloat(formData.baseLat) || 19.076,
        lng: parseFloat(formData.baseLng) || 72.8777,
      };

      const mapInstance = new window.google.maps.Map(mapContainer, {
        center: defaultCenter,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
      });
      mapRef.current = mapInstance;

      const marker = new window.google.maps.Marker({
        position: defaultCenter,
        map: mapInstance,
        draggable: true,
      });
      markerRef.current = marker;

      const updatePos = (lat, lng) => {
        setFormData((p) => ({ ...p, baseLat: lat, baseLng: lng }));
        reverseGeocode({ lat, lng });
      };

      marker.addListener("dragend", (e) =>
        updatePos(e.latLng.lat(), e.latLng.lng())
      );

      mapInstance.addListener("click", (e) =>
        updatePos(e.latLng.lat(), e.latLng.lng())
      );
    } catch (err) {
      console.warn("Map init failed:", err);
    }
  };

  /* ------------------ Clean map on modal close ------------------ */
  useEffect(() => {
    if (showAddForm) {
      setTimeout(() => initMap(), 250);
    } else {
      mapRef.current = null;
      markerRef.current = null;
    }
  }, [showAddForm]);

  /* ------------------ Reverse geocode ------------------ */
  const reverseGeocode = (pos) => {
    if (!window.google || !window.google.maps) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: pos }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        setFormData((p) => ({
          ...p,
          baseAddress: results[0].formatted_address,
        }));
      }
    });
  };

  /* ------------------ Autocomplete ------------------ */
  const handleSearchInput = (value) => {
    setFormData((p) => ({ ...p, baseAddress: value }));
    if (!window.google || !window.google.maps) return setSuggestions([]);
    if (value.length < 3) return setSuggestions([]);

    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions(
      { input: value, componentRestrictions: { country: "in" } },
      (preds, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK)
          setSuggestions(preds);
        else setSuggestions([]);
      }
    );
  };

  const selectSuggestion = (placeId) => {
    setSuggestions([]);
    if (!window.google || !mapRef.current) return;

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    service.getDetails({ placeId }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
        const pos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setFormData((p) => ({
          ...p,
          baseAddress: place.formatted_address,
          baseLat: pos.lat,
          baseLng: pos.lng,
        }));
        mapRef.current.setCenter(pos);
        if (markerRef.current) markerRef.current.setPosition(pos);
      }
    });
  };

  /* ------------------ Use My Location ------------------ */
  const getUserCurrentLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setFormData((p) => ({ ...p, baseLat: lat, baseLng: lng }));
        if (mapRef.current && markerRef.current) {
          mapRef.current.setCenter({ lat, lng });
          markerRef.current.setPosition({ lat, lng });
        }
        reverseGeocode({ lat, lng });
      },
      () => alert("Failed to fetch location."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  /* ------------------ Fetch equipments ------------------ */
  /* ------------------ Fetch equipments ------------------ */
const fetchEquipments = async () => {
  try {
    const vendorId = localStorage.getItem("userId");
    if (!vendorId) return setEquipments([]);

    const res = await fetch(`${API_BASE_URL}/api/equipments?vendorId=${vendorId}`);
    const data = await res.json();

    console.log("Vendor Equipments:", data);

    // FIX: use data.equipments not data.items
    setEquipments(Array.isArray(data.equipments) ? data.equipments : []);
  } catch (e) {
    console.error("❌ Fetch error:", e);
    setEquipments([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchEquipments();
  }, []);


  /* ------------------ Image Preview ------------------ */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  /* ------------------ Delete Equipment ------------------ */
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/equipments/${id}`, {
        method: "DELETE",
      });
      if (res.ok) await fetchEquipments();
    } catch (err) {
      console.error("❌ Delete error:", err);
    }
  };

  /* ------------------ Add / Update ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const vendorId = localStorage.getItem("userId");
      const url = editingEquipment
        ? `${API_BASE_URL}/api/equipments/${editingEquipment.id}`
        : `${API_BASE_URL}/api/equipments`;
      const method = editingEquipment ? "PUT" : "POST";

      const formDataToSend = new FormData();
      for (const key in formData) formDataToSend.append(key, formData[key]);
      formDataToSend.append("vendorId", vendorId);

      const input = document.getElementById("equipmentImages");
      if (input?.files.length) {
        for (const f of input.files) formDataToSend.append("images", f);
      }

      const res = await fetch(url, { method, body: formDataToSend });
      const result = await res.json();
      if (res.ok) {
        setMessage("✅ Equipment saved successfully!");
        await fetchEquipments();
        resetForm();
      } else alert(result.error || "Failed to save");
    } catch (err) {
      console.error("❌ Save error:", err);
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
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

  const filteredEquipments = equipments.filter(
    (eq) =>
      eq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ------------------ UI ------------------ */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading equipments...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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

        {/* Search */}
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

        {/* ---------- Add/Edit Modal ---------- */}
        {showAddForm && (
          <div className="fixed top-25 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-2xl mx-auto my-10 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-y-auto max-h-[90vh]">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingEquipment ? "Edit Equipment" : "Add Equipment"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-800 font-medium"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[75vh]">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {message && (
                    <div className="p-2 bg-blue-50 text-blue-700 border border-blue-200 rounded text-sm text-center">
                      {message}
                    </div>
                  )}

                  {/* Equipment Info */}
                  <input
                    type="text"
                    placeholder="Equipment Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full border p-2 rounded-md"
                  />
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    required
                    className="w-full border p-2 rounded-md"
                  >
                    <option value="">Select Type</option>
                    <option>Excavator</option>
                    <option>Crane</option>
                    <option>Bulldozer</option>
                    <option>Loader</option>
                    <option>Concrete Mixer</option>
                    <option>Other</option>
                  </select>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Brand"
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      className="border p-2 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="Model"
                      value={formData.model}
                      onChange={(e) =>
                        setFormData({ ...formData, model: e.target.value })
                      }
                      className="border p-2 rounded-md"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Capacity (e.g. 3 Tons)"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: e.target.value })
                      }
                      className="border p-2 rounded-md"
                    />
                    <input
                      type="number"
                      placeholder="Manufacturing Year"
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({ ...formData, year: e.target.value })
                      }
                      className="border p-2 rounded-md"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Quantity Available"
                      value={formData.quantity ?? ""}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                      className="border p-2 rounded-md"
                    />

                    <input
                      type="number"
                      placeholder="Price per day (₹)"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                      className="border p-2 rounded-md"
                    />
                  </div>

                  <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full border p-2 rounded-md"
                  />

                  {/* Location Picker */}
                  <div className="space-y-3">
                    <label className="text-sm text-gray-700 flex items-center mb-1">
                      <MapPin className="w-4 h-4 mr-1" /> Set Equipment Base
                      Location
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search yard address..."
                        value={formData.baseAddress}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:border-blue-500"
                      />
                      {suggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {suggestions.map((s) => (
                            <div
                              key={s.place_id}
                              onClick={() => selectSuggestion(s.place_id)}
                              className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                            >
                              {s.description}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={getUserCurrentLocation}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <Navigation className="h-4 w-4" /> Use My Location
                    </button>

                    <div
                      id="equipmentMap"
                      className="w-full h-64 rounded-lg border-2 border-gray-300 bg-gray-100"
                    ></div>

                    {formData.baseLat && (
                      <p className="text-xs text-gray-600 mt-1">
                        📍 <b>Lat:</b>{" "}
                        {isNaN(parseFloat(formData.baseLat))
                          ? formData.baseLat
                          : parseFloat(formData.baseLat).toFixed(5)}{" "}
                        <b>Lng:</b>{" "}
                        {isNaN(parseFloat(formData.baseLng))
                          ? formData.baseLng
                          : parseFloat(formData.baseLng).toFixed(5)}
                      </p>
                    )}

                  </div>

                  {/* Image upload */}
                  <input
                    id="equipmentImages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full border p-2 rounded-md"
                  />
                  {imagePreviews.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {imagePreviews.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          className="w-16 h-16 object-cover rounded-md border"
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving
                        ? "Saving..."
                        : editingEquipment
                          ? "Update"
                          : "Add"}{" "}
                      Equipment
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ---------- Equipment Grid ---------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipments.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10">
              <Package className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              No equipments added yet.
            </div>
          ) :
            (
              filteredEquipments.map((eq) => (
                <div
                  key={eq.id}
                  className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition"
                >
                  <div className="h-40 bg-gray-100 rounded-md overflow-hidden mb-3">
                    {eq.images?.[0] ? (
                      <img
                        src={
                          eq.images[0].url
                            ? `${API_BASE_URL}${eq.images[0].url}`
                            : eq.images[0]
                        }
                        className="w-full h-full object-cover"
                        alt={eq.name}
                      />
                    ) : (
                      <Package className="h-10 w-10 text-gray-400 mx-auto mt-14" />
                    )}
                  </div>
                        <span className="font-semibold">Equipment ID:</span> {eq.id}

                  <h3 className="font-semibold text-lg text-gray-900">
                    {eq.name}
                  </h3>
                  <p className="text-sm text-gray-600">{eq.type}</p>
                  <p className="text-blue-600 font-bold">₹{eq.price}/day</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Location: {eq.baseAddress || "Not set"}
                  </p>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(eq)}
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
