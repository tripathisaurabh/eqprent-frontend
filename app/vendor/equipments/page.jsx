"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Package, Search } from "lucide-react";
import { API_BASE_URL } from "@/lib/apiConfig";

export default function VendorEquipments() {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);

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

  // ---------------- FETCH VENDOR EQUIPMENTS ----------------
  const fetchEquipments = async () => {
    try {
      const vendorId = localStorage.getItem("userId");
      if (!vendorId) return;

      const res = await fetch(
        `${API_BASE_URL}/api/equipments/vendor?vendorId=${vendorId}`
      );
      const data = await res.json();

      console.log("Vendor Equipments →", data);

      setEquipments(Array.isArray(data.equipments) ? data.equipments : []);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  // ---------------- IMAGE PREVIEW ----------------
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImagePreview(files.map((f) => URL.createObjectURL(f)));
  };

  // ---------------- DELETE EQUIPMENT ----------------
  const handleDelete = async (id) => {
    if (!confirm("Delete equipment?")) return;

    try {
      await fetch(`${API_BASE_URL}/api/equipments/${id}`, { method: "DELETE" });
      fetchEquipments();
    } catch (err) {
      console.error("❌ Delete error:", err);
    }
  };

  // ---------------- SUBMIT FORM ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const vendorId = localStorage.getItem("userId");

    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `${API_BASE_URL}/api/equipments/${editing.id}`
      : `${API_BASE_URL}/api/equipments`;

    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
    fd.append("vendorId", vendorId);

    const fileInput = document.getElementById("eqImages");
    if (fileInput?.files.length > 0) {
      Array.from(fileInput.files).forEach((file) => fd.append("images", file));
    }

    const res = await fetch(url, { method, body: fd });
    const data = await res.json();

    if (data.success) {
      resetForm();
      fetchEquipments();
    }

    setSaving(false);
  };

  // ---------------- RESET FORM ----------------
  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setImagePreview([]);
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

  // ---------------- FILTER ----------------
  const filtered = equipments.filter((eq) =>
    eq.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ---------------- GET IMAGE URL ----------------
  const getImageUrl = (img) => {
    if (!img?.url) return null;
    if (img.url.startsWith("http")) return img.url;
    return `${API_BASE_URL}${img.url}`;
  };

  // ---------------- UI ----------------
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4 pb-20">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Equipments</h1>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> Add Equipment
          </button>
        </div>

        {/* SEARCH */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-3 py-2 rounded-lg border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* FORM MODAL */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[1000] p-4">
            <div className="bg-white w-full max-w-xl rounded-xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">

              <h2 className="text-xl font-bold mb-4">
                {editing ? "Edit Equipment" : "Add Equipment"}
              </h2>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-3">

                {/** simple auto fields */}
                {[
                  "name",
                  "type",
                  "brand",
                  "model",
                  "capacity",
                  "year",
                  "quantity",
                  "price",
                  "description",
                  "pincode",
                  "landmark",
                  "baseAddress",
                  "perKmRate",
                ].map((f) => (
                  <input
                    key={f}
                    type="text"
                    placeholder={f}
                    value={formData[f]}
                    onChange={(e) =>
                      setFormData({ ...formData, [f]: e.target.value })
                    }
                    className="w-full border rounded-md p-2"
                  />
                ))}

                <input
                  id="eqImages"
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  className="w-full border rounded-md p-2"
                />

                {/* Preview */}
                <div className="flex gap-2 overflow-x-auto">
                  {imagePreview.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                  ))}
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-200 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {filtered.map((eq) => (
            <div
              key={eq.id}
              className="bg-white p-4 rounded-lg shadow-sm border"
            >
              <div className="h-40 bg-gray-100 rounded-md overflow-hidden mb-3">
                {eq.images?.length ? (
                  <img
                    src={getImageUrl(eq.images[0])}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-10 h-10 text-gray-400 mx-auto mt-14" />
                )}
              </div>

              <h3 className="font-bold">{eq.name}</h3>
              <p className="text-sm text-gray-600">{eq.type}</p>
              <p className="font-semibold text-blue-600">₹{eq.price}/day</p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setEditing(eq);
                    setFormData({ ...eq });
                    setShowForm(true);
                  }}
                  className="flex-1 border rounded-md py-1 text-sm"
                >
                  <Edit size={16} className="inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(eq.id)}
                  className="flex-1 border border-red-400 text-red-600 rounded-md py-1 text-sm"
                >
                  <Trash2 size={16} className="inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
