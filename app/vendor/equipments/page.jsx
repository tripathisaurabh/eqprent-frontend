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
   SAFE GOOGLE MAPS SCRIPT LOADER
------------------------------------- */
const loadGoogleMaps = () => {
  if (typeof window === "undefined") return;
  if (window.google && window.google.maps) return;

  const existing = document.querySelector(
    'script[src*="maps.googleapis.com/maps/api/js"]'
  );
  if (existing) return;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing");
    return;
  }

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
};

/* ------------------------------------
   COMPONENT
------------------------------------- */
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

  // MAP REFS
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
    perKmRate: "150",
    baseLat: "",
    baseLng: "",
  });

  /* ------------------------------------
     EDIT EQUIPMENT
  ------------------------------------- */
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

  /* ------------------------------------
     LOAD GOOGLE MAPS SCRIPT ONCE
  ------------------------------------- */
  useEffect(() => {
    loadGoogleMaps();
  }, []);

  /* ------------------------------------
     REVERSE GEOCODE (LAT,LNG → ADDRESS)
  ------------------------------------- */
  const reverseGeocode = (pos) => {
    if (!window.google || !window.google.maps) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: pos }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        setFormData((prev) => ({
          ...prev,
          baseAddress: results[0].formatted_address,
        }));
      }
    });
  };

  /* ------------------------------------
     AUTOCOMPLETE SEARCH
  ------------------------------------- */
  const handleSearchInput = (value) => {
    setFormData((prev) => ({ ...prev, baseAddress: value }));

    if (!window.google || !window.google.maps) {
      setSuggestions([]);
      return;
    }

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: "in" },
      },
      (preds, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          preds &&
          preds.length > 0
        ) {
          setSuggestions(preds);
        } else {
          setSuggestions([]);
        }
      }
    );
  };

  const selectSuggestion = (placeId) => {
    setSuggestions([]);

    if (!window.google || !window.google.maps || !mapRef.current) return;

    const service = new window.google.maps.places.PlacesService(mapRef.current);

    service.getDetails({ placeId }, (place, status) => {
      if (
        status === window.google.maps.places.PlacesServiceStatus.OK &&
        place &&
        place.geometry
      ) {
        const position = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        setFormData((prev) => ({
          ...prev,
          baseAddress: place.formatted_address,
          baseLat: position.lat,
          baseLng: position.lng,
        }));

        mapRef.current.setCenter(position);
        if (markerRef.current) {
          markerRef.current.setPosition(position);
        }
      }
    });
  };

  /* ------------------------------------
     INIT MAP WHEN MODAL OPENS
  ------------------------------------- */
  const initMap = () => {
    if (!showAddForm) return;

    const container = document.getElementById("equipmentMap");
    if (!container) return;
    if (!window.google || !window.google.maps) return;

    // avoid re-init
    if (mapRef.current) return;

    const center = {
      lat: parseFloat(formData.baseLat) || 19.076, // Mumbai default
      lng: parseFloat(formData.baseLng) || 72.8777,
    };

    const mapInstance = new window.google.maps.Map(container, {
      center,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
    });

    mapRef.current = mapInstance;

    const marker = new window.google.maps.Marker({
      position: center,
      map: mapInstance,
      draggable: true,
    });

    markerRef.current = marker;

    const updatePos = (lat, lng) => {
      setFormData((prev) => ({
        ...prev,
        baseLat: lat.toString(),
        baseLng: lng.toString(),
      }));
      reverseGeocode({ lat, lng });
    };

    marker.addListener("dragend", (e) =>
      updatePos(e.latLng.lat(), e.latLng.lng())
    );

    mapInstance.addListener("click", (e) =>
      updatePos(e.latLng.lat(), e.latLng.lng())
    );
  };

  useEffect(() => {
    if (showAddForm) {
      // give modal some time to render DOM
      setTimeout(() => {
        initMap();
      }, 300);
    } else {
      mapRef.current = null;
      markerRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAddForm]);

  /* ------------------------------------
     USE MY LOCATION
  ------------------------------------- */
  const getUserCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setFormData((prev) => ({
          ...prev,
          baseLat: lat.toString(),
          baseLng: lng.toString(),
        }));

        if (mapRef.current && markerRef.current) {
          const loc = { lat, lng };
          mapRef.current.setCenter(loc);
          markerRef.current.setPosition(loc);
        }

        reverseGeocode({ lat, lng });
      },
      () => {
        alert("Failed to fetch location");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  /* ------------------------------------
     FETCH VENDOR EQUIPMENTS
  ------------------------------------- */
const fetchEquipments = async () => {
  try {
    const vendorId = localStorage.getItem("userId");
    if (!vendorId) {
      console.warn("⚠️ No vendorId found");
      setEquipments([]);
      setLoading(false);
      return;
    }

    const res = await fetch(
      `${API_BASE_URL}/api/equipments/vendor/${vendorId}`
    );

    const data = await res.json();
    console.log("🟢 Vendor Equipments API:", data);

    setEquipments(data.items || []);
  } catch (err) {
    console.error("❌ Fetch vendor equipments error:", err);
    setEquipments([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchEquipments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------
     IMAGE PREVIEWS
  ------------------------------------- */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  /* ------------------------------------
     SAVE (ADD / UPDATE) EQUIPMENT
  ------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const vendorId = localStorage.getItem("userId");
      if (!vendorId) {
        alert("Vendor not found. Please login again.");
        setSaving(false);
        return;
      }

      const method = editingEquipment ? "PUT" : "POST";
      const url = editingEquipment
        ? `${API_BASE_URL}/api/equipments/${editingEquipment.id}`
        : `${API_BASE_URL}/api/equipments`;

      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key] ?? "");
      });
      formDataToSend.append("vendorId", vendorId);

      const input = document.getElementById("equipmentImages");
      if (input?.files?.length) {
        Array.from(input.files).forEach((file) => {
          formDataToSend.append("images", file);
        });
      }

      const res = await fetch(url, { method, body: formDataToSend });
      const result = await res.json();

      if (res.ok) {
        setMessage("✅ Saved successfully!");
        await fetchEquipments();
        resetForm();
      } else {
        console.error("❌ Save failure:", result);
        alert(result.message || "Failed to save equipment");
      }
    } catch (err) {
      console.error("❌ Save error:", err);
    }

    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  /* ------------------------------------
     DELETE
  ------------------------------------- */
  const handleDelete = async (id) => {
    if (!confirm("Delete this equipment?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/equipments/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchEquipments();
      }
    } catch (err) {
      console.error("❌ Delete error:", err);
    }
  };

  /* ------------------------------------
     RESET FORM
  ------------------------------------- */
  const resetForm = () => {
    setEditingEquipment(null);
    setShowAddForm(false);
    setImagePreviews([]);
    setSuggestions([]);
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

  /* ------------------------------------
     FILTER EQUIPMENTS
  ------------------------------------- */
  const filteredEquipments = equipments.filter(
    (eq) =>
      eq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ------------------------------------
     UI
  ------------------------------------- */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
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

        {/* MODAL */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center overflow-y-auto">
            <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto border">
              {/* TITLE */}
              <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {editingEquipment ? "Edit Equipment" : "Add Equipment"}
                </h2>
                <button onClick={resetForm} className="text-gray-500">
                  ✕
                </button>
              </div>

              {/* FORM */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {message && (
                    <div className="p-2 bg-blue-50 text-blue-700 text-center rounded">
                      {message}
                    </div>
                  )}

                  {/* NAME */}
                  <input
                    type="text"
                    placeholder="Equipment Name"
                    className="w-full border p-2 rounded-md"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />

                  {/* TYPE */}
                  <select
                    className="w-full border p-2 rounded-md"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Type</option>
                    <option>Excavator</option>
                    <option>Crane</option>
                    <option>Loader</option>
                    <option>Concrete Mixer</option>
                    <option>Bulldozer</option>
                    <option>Other</option>
                  </select>

                  {/* BRAND + MODEL */}
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Brand"
                      className="border p-2 rounded-md"
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Model"
                      className="border p-2 rounded-md"
                      value={formData.model}
                      onChange={(e) =>
                        setFormData({ ...formData, model: e.target.value })
                      }
                    />
                  </div>

                  {/* CAPACITY + YEAR */}
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Capacity"
                      className="border p-2 rounded-md"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      placeholder="Year"
                      className="border p-2 rounded-md"
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({ ...formData, year: e.target.value })
                      }
                    />
                  </div>

                  {/* QUANTITY + PRICE */}
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Quantity"
                      className="border p-2 rounded-md"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      required
                    />
                    <input
                      type="number"
                      placeholder="Price/day"
                      className="border p-2 rounded-md"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* DESCRIPTION */}
                  <textarea
                    placeholder="Description"
                    className="w-full border p-2 rounded-md"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                  />

                  {/* LOCATION SEARCH + MAP */}
                  <label className="text-sm font-medium">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Set Base Location
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search address..."
                      className="w-full border p-2 rounded-md"
                      value={formData.baseAddress}
                      onChange={(e) => handleSearchInput(e.target.value)}
                    />
                    {suggestions.length > 0 && (
                      <div className="absolute z-50 bg-white border border-gray-200 rounded-md mt-1 shadow-lg max-h-56 overflow-y-auto w-full">
                        {suggestions.map((s) => (
                          <div
                            key={s.place_id}
                            onClick={() => selectSuggestion(s.place_id)}
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 border-b last:border-b-0"
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
                    className="mt-2 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md"
                  >
                    <Navigation className="h-4 w-4" /> Use My Location
                  </button>

                  <div
                    id="equipmentMap"
                    className="w-full h-64 bg-gray-100 border rounded-md mt-2"
                  ></div>

                  {formData.baseLat && formData.baseLng && (
                    <p className="text-xs text-gray-600 mt-1">
                      📍 <b>Lat:</b> {formData.baseLat} &nbsp; <b>Lng:</b>{" "}
                      {formData.baseLng}
                    </p>
                  )}

                  {/* IMAGES */}
                  <input
                    id="equipmentImages"
                    type="file"
                    multiple
                    accept="image/*"
                    className="w-full border p-2 rounded-md"
                    onChange={handleImageChange}
                  />
                  {imagePreviews.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {imagePreviews.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          className="w-16 h-16 rounded-md object-cover border"
                          alt="Preview"
                        />
                      ))}
                    </div>
                  )}

                  {/* BUTTONS */}
                  <div className="flex gap-3 mt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-md"
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
                      className="flex-1 bg-gray-200 py-2 rounded-md"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* EQUIPMENT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipments.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10">
              <Package className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              No equipment found.
            </div>
          ) : (
            filteredEquipments.map((eq) => (
              <div
                key={eq.id}
                className="bg-white p-4 rounded-lg shadow-sm border"
              >
                <div className="h-40 bg-gray-100 rounded-md mb-3 overflow-hidden">
                  {eq.images?.[0] ? (
                    <img
                      src={
                        eq.images[0].url?.startsWith("http")
                          ? eq.images[0].url
                          : `${API_BASE_URL}${eq.images[0].url}`
                      }
                      className="w-full h-full object-cover"
                      alt={eq.name}
                    />
                  ) : (
                    <Package className="w-10 h-10 text-gray-300 mx-auto mt-14" />
                  )}
                </div>

                <p className="text-sm text-gray-500">
                  <b>ID:</b> {eq.id}
                </p>

                <h3 className="font-semibold text-lg">{eq.name}</h3>
                <p className="text-sm text-gray-600">{eq.type}</p>

                <p className="text-blue-600 font-bold">₹{eq.price}/day</p>

                <p className="text-sm text-gray-500">
                  Location: {eq.baseAddress || "Not set"}
                </p>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(eq)}
                    className="flex-1 border border-gray-300 rounded-md py-1 text-sm"
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
      </div>
    </div>
  );
}
