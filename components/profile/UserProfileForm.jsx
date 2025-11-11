"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Phone, Mail, MapPin, Building, Loader2, Edit2, Check } from "lucide-react";
import InputField from "@/components/ui/InputField";
import TextAreaField from "@/components/ui/TextAreaField";

export default function UserProfileForm() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    companyName: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const role = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;

  // 🔹 Fetch user
  useEffect(() => {
    if (!userId || !token || role !== "USER") {
      window.location.href = "/login";
      return;
    }
    fetchProfile(userId);
  }, []);

  const fetchProfile = async (id) => {
    try {
      const res = await fetch(`http://localhost:5001/api/users/${id}`);
      const data = await res.json();
      if (data.success && data.user) setUser(data.user);
    } catch (err) {
      console.error("❌ Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!user.phone || !/^\d{10}$/.test(user.phone)) {
      setMessage("⚠️ Please enter a valid 10-digit phone number");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`http://localhost:5001/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("✅ Profile updated successfully!");
        setEditing(false);
        localStorage.setItem("userPhoneLast4", user.phone.slice(-4));
      } else setMessage("❌ Failed to update profile");
    } catch (err) {
      console.error("❌ Error updating profile:", err);
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading profile...
      </div>
    );

  return (
<div className="min-h-screen bg-gray-50 pt-28 pb-10 px-6">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <User className="text-blue-600 w-8 h-8 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
          >
            {editing ? <Check className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
            {editing ? "Done" : "Edit"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField label="Full Name" name="name" icon={<User className="w-4 h-4" />} value={user.name} onChange={handleChange} editable={editing} />
          <InputField label="Phone Number" name="phone" icon={<Phone className="w-4 h-4" />} value={user.phone} onChange={handleChange} editable={editing} required />
          <InputField label="Email" name="email" icon={<Mail className="w-4 h-4" />} value={user.email} editable={false} />
          <InputField label="Company Name" name="companyName" icon={<Building className="w-4 h-4" />} value={user.companyName || ""} onChange={handleChange} editable={editing} placeholder="Optional" />
          <div className="md:col-span-2">
            <TextAreaField label="Address" name="address" icon={<MapPin className="w-4 h-4" />} value={user.address || ""} onChange={handleChange} editable={editing} />
          </div>
        </div>

        {editing && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium flex items-center gap-2"
            >
              {saving && <Loader2 className="animate-spin w-4 h-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        {message && <p className="mt-4 text-center text-sm font-medium text-blue-600">{message}</p>}
      </motion.div>
    </div>
  );
}
