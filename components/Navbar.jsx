"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Menu, X, Wrench, Headphones, ClipboardList, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  /* ✅ Check auth on mount */
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      const storedRole = localStorage.getItem("userRole");
      if (token && storedRole) {
        setLoggedIn(true);
        setRole(storedRole);
      } else {
        setLoggedIn(false);
        setRole(null);
      }
    };
    checkAuthStatus();
    window.addEventListener("storage", checkAuthStatus);
    window.addEventListener("authStateChanged", checkAuthStatus);
    return () => {
      window.removeEventListener("storage", checkAuthStatus);
      window.removeEventListener("authStateChanged", checkAuthStatus);
    };
  }, []);

  /* ✅ Scroll shadow effect */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ✅ Close dropdown when clicking outside */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ✅ Logout handler */
  const handleLogout = () => {
    localStorage.clear();
    setLoggedIn(false);
    setRole(null);
    window.dispatchEvent(new CustomEvent("authStateChanged"));
    window.location.href = "/";
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-md bg-white/80 shadow-lg border-b border-gray-200"
          : "bg-transparent"
      }`}
    >
      {/* ---------- TOP BAR ---------- */}
      <div className="flex justify-between items-center px-6 py-2 bg-gradient-to-r from-[#14213D] to-[#1f2e5e] text-white text-sm shadow-sm h-12">
        {/* ✅ Brand updated */}
        <Link
          href="/"
          className="font-extrabold text-xl tracking-wide hover:text-blue-300 transition-all duration-200"
        >
          Eqp<span className="text-blue-400">Rent</span>
        </Link>

        {/* ---------- Account / Auth ---------- */}
        <div className="flex items-center space-x-5 relative">
          {loggedIn ? (
            <>
              <Link
                href={role === "VENDOR" ? "/vendor" : "/dashboard"}
                className="hover:text-blue-300 font-medium transition"
              >
                {role === "VENDOR" ? "Vendor Dashboard" : "Dashboard"}
              </Link>

              {/* 👤 Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-500 hover:bg-blue-600 transition-all duration-200 shadow-md"
                >
                  <User size={18} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-[60]"
                    >
                      <div className="flex flex-col text-sm text-gray-700">
                        <Link
                          href={role === "VENDOR" ? "/vendor" : "/dashboard"}
                          onClick={() => setDropdownOpen(false)}
                          className="px-4 py-2 hover:bg-gray-100"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href={
                            role === "VENDOR" ? "/vendor/profile" : "/profile"
                          }
                          onClick={() => setDropdownOpen(false)}
                          className="px-4 py-2 hover:bg-gray-100"
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="text-left px-4 py-2 text-red-600 hover:bg-red-50 border-t border-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hover:text-blue-300 font-medium transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-blue-500 hover:bg-blue-600 px-4 py-1.5 rounded-md text-white font-semibold shadow-sm transition-all duration-200"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ---------- MAIN NAVBAR ---------- */}
      <nav className="bg-white/90 border-b border-gray-200 shadow-sm relative h-14 flex items-center">
        <div className="container mx-auto flex justify-center items-center px-6 relative">
          {/* Hamburger (mobile) */}
          <button
            className="absolute left-4 md:hidden text-gray-800 focus:outline-none transition-transform z-[70]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex space-x-10 font-medium text-gray-700">
            {[
              { href: "/equipments", icon: <Wrench size={18} />, text: "Equipments" },
              ...(loggedIn && role === "VENDOR"
                ? [
                    { href: "/vendor/equipments", icon: <Wrench size={18} />, text: "My Equipment" },
                    { href: "/vendor/bookings", icon: <ClipboardList size={18} />, text: "Bookings" },
                  ]
                : [{ href: "/track", icon: <ClipboardList size={18} />, text: "Track Booking" }]),
              { href: "/support", icon: <Headphones size={18} />, text: "Support" },
            ].map(({ href, icon, text }) => (
              <Link
                key={href}
                href={href}
                className="relative group flex items-center gap-1 hover:text-blue-600 transition"
              >
                {icon}
                {text}
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>
        </div>

        {/* ---------- MOBILE MENU ---------- */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-[60] md:hidden"
            >
              <div className="flex flex-col space-y-4 px-6 py-5 text-gray-800 text-base font-medium">
                <Link href="/equipments" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 hover:text-blue-600">
                  <Wrench size={18} /> Equipments
                </Link>

                {loggedIn && role === "VENDOR" ? (
                  <>
                    <Link href="/vendor/equipments" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 hover:text-blue-600">
                      <Wrench size={18} /> My Equipment
                    </Link>
                    <Link href="/vendor/bookings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 hover:text-blue-600">
                      <ClipboardList size={18} /> Bookings
                    </Link>
                  </>
                ) : (
                  <Link href="/track" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 hover:text-blue-600">
                    <ClipboardList size={18} /> Track Booking
                  </Link>
                )}

                <Link href="/support" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 hover:text-blue-600">
                  <Headphones size={18} /> Support
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
