"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Building, MapPin, Phone, Mail, Save, Upload } from "lucide-react";
import { API_BASE_URL } from "@/lib/apiConfig";

export default function VendorProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    companyName: "",
    profileImg: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);   // ✅ FIXED
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userId = localStorage.getItem("userId");

      const response = await fetch(`${API_BASE_URL}/api/vendors/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      setProfile(data);

    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED handleChange (missing earlier)
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const userId = localStorage.getItem("userId");
      const formData = new FormData();

      formData.append("name", profile.name);
      formData.append("phone", profile.phone);
      formData.append("address", profile.address);
      formData.append("companyName", profile.companyName);

      const response = await fetch(`${API_BASE_URL}/api/vendors/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        setMessage("Profile updated successfully!");
      } else {
        setMessage("Failed to update profile.");
      }

    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage("Unexpected error.");
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vendor Profile</h1>
          <p className="text-gray-600 mt-2">Manage your vendor profile and company information</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Profile Image */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">

              <div className="mx-auto h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                {profile.profileImg ? (
                  <img src={profile.profileImg} className="h-24 w-24 rounded-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-gray-400" />
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1">{profile.name || "Vendor Name"}</h3>
              <p className="text-sm text-gray-600 mb-4">{profile.companyName || "Company Name"}</p>

              <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Upload className="h-4 w-4 mr-2" /> Change Photo
              </button>
            </div>
          </motion.div>


          {/* Profile Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">

                {/* Message */}
                {message && (
                  <div className={`p-4 rounded-md ${
                    message.includes("successfully") 
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    {message}
                  </div>
                )}

                {/* Full name + email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input type="text" name="name" value={profile.name} onChange={handleChange} required
                      className="w-full pl-10 pr-4 py-2 border rounded-md" />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Email</label>
                    <input type="email" value={profile.email} disabled
                      className="w-full pl-10 pr-4 py-2 border rounded-md bg-gray-100" />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                </div>

                {/* Phone + Company */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm mb-2">Phone</label>
                    <input type="tel" name="phone" value={profile.phone} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border rounded-md" />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Company Name</label>
                    <input type="text" name="companyName" value={profile.companyName} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border rounded-md" />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm mb-2">Address</label>
                  <textarea name="address" value={profile.address} onChange={handleChange} rows={3}
                    className="w-full pl-10 pr-4 py-2 border rounded-md"></textarea>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-6">
                  <button type="submit" disabled={saving}
                    className="px-6 py-2 text-white bg-blue-600 rounded-md disabled:opacity-50">
                    <Save className="h-4 w-4 mr-2 inline-block" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>

              </form>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
