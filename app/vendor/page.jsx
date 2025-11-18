"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Package, Users, DollarSign, TrendingUp, Eye } from "lucide-react";
import { API_BASE_URL } from "@/lib/apiConfig";

export default function VendorDashboard() {
  const [user, setUser] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    const userName = localStorage.getItem("userName");

    if (!token || userRole !== "VENDOR") {
      window.location.href = "/login";
      return;
    }

    setUser({ name: userName, role: userRole });
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      const vendorId = localStorage.getItem("userId");
      if (!vendorId) throw new Error("Vendor ID not found");

      // Fetch vendor equipments
      const equipmentsResponse = await fetch(
        `${API_BASE_URL}/api/equipments?vendorId=${vendorId}`
      );

      const eqData = await equipmentsResponse.json();
      console.log("Vendor equipments:", eqData);

      const list = Array.isArray(eqData.items)
        ? eqData.items
        : Array.isArray(eqData.equipments)
        ? eqData.equipments
        : Array.isArray(eqData)
        ? eqData
        : [];

      setEquipments(list);

      // Fetch bookings
      const bookingsResponse = await fetch(
        `${API_BASE_URL}/api/bookings/vendor/${vendorId}`
      );

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData || []);
      }
    } catch (error) {
      console.error("Error fetching vendor data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your equipment inventory and bookings
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <DashboardCard icon={<Package className="h-8 w-8 text-blue-600 mr-4" />} label="Total Equipment" value={equipments.length} />
          <DashboardCard icon={<Users className="h-8 w-8 text-green-600 mr-4" />} label="Active Bookings" value={bookings.length} />
          <DashboardCard icon={<DollarSign className="h-8 w-8 text-yellow-600 mr-4" />} label="Monthly Revenue" value="COMING SOON" />
          <DashboardCard icon={<TrendingUp className="h-8 w-8 text-purple-600 mr-4" />} label="Growth Rate" value="COMING SOON" />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <QuickActionCard href="/vendor/equipments" icon={<Package className="h-8 w-8 text-blue-600 mr-4" />} title="Manage Equipment" desc="Add, edit, or remove equipment" />
          <QuickActionCard href="/vendor/bookings" icon={<Eye className="h-8 w-8 text-green-600 mr-4" />} title="View Bookings" desc="Manage customer bookings" />
          <QuickActionCard href="/vendor/profile" icon={<Users className="h-8 w-8 text-purple-600 mr-4" />} title="Profile Settings" desc="Update your vendor profile" />
        </motion.div>

        {/* Recent Equipment */}
        <motion.div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Your Equipment</h2>
            <Link href="/vendor/equipments" className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" /> Add Equipment
            </Link>
          </div>

          <div className="p-6">
            {equipments.length === 0 ? (
              <EmptyEquipment />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipments.slice(0, 6).map((equipment) => (
                  <EquipmentCard key={equipment.id} equipment={equipment} />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------
   COMPONENTS
------------------------------------------ */

function DashboardCard({ icon, label, value }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center">
      {icon}
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function QuickActionCard({ href, icon, title, desc }) {
  return (
    <Link href={href} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-center">
        {icon}
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-gray-600">{desc}</p>
        </div>
      </div>
    </Link>
  );
}

function EquipmentCard({ equipment }) {
  const firstImage = equipment.images?.[0];

  const imageSrc = firstImage
    ? firstImage.url?.startsWith("http")
      ? firstImage.url
      : `${API_BASE_URL}${firstImage.url}`
    : "/placeholder.jpg";

  return (
    <div className="border rounded-lg p-4 hover:shadow transition">
      <div className="w-full h-32 bg-gray-200 rounded-lg mb-4 overflow-hidden">
        <img src={imageSrc} className="w-full h-full object-cover" />
      </div>
      <h3 className="font-semibold text-lg">{equipment.name}</h3>
      <p className="text-sm text-gray-600">Type: {equipment.type}</p>
      <p className="text-blue-600 font-bold">₹{equipment.price}/day</p>
    </div>
  );
}

function EmptyEquipment() {
  return (
    <div className="text-center py-12">
      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment added yet</h3>
      <p className="text-gray-600 mb-6">Start by adding your first equipment</p>
      <Link href="/vendor/equipments" className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700">
        <Plus className="h-4 w-4 mr-2" /> Add Equipment
      </Link>
    </div>
  );
}
