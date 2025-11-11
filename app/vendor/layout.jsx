"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function VendorLayout({ children }) {
  const [open, setOpen] = useState(false);
  const [vendorName, setVendorName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("vendorName") || "Vendor";
    setVendorName(name);
  }, []);

  return (
    <ProtectedRoute allowedRole="VENDOR">
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* <header className="w-full bg-[#14213D] text-white flex justify-between items-center px-6 py-3 shadow-md">
          <h1 className="text-2xl font-bold tracking-wide">HeavyRent Vendor</h1>
          <button onClick={() => setOpen(!open)} className="md:hidden text-white">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header> */}

        <div className="flex flex-1">
          <aside
            className={`${
              open ? "block" : "hidden"
            } md:block bg-white shadow-md w-64 p-5 border-r border-gray-200`}
          >
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-[#14213D] mb-1">
                {vendorName}
              </h2>
              <p className="text-gray-500 text-sm">Vendor Dashboard</p>
            </div>
            <nav className="flex flex-col space-y-3 text-gray-700 font-medium">
              <Link href="/vendor">Dashboard</Link>
              <Link href="/vendor/profile">Profile</Link>
              <Link href="/vendor/equipments">Equipments</Link>
              <Link href="/vendor/bookings">Bookings</Link>
            </nav>
          </aside>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
