"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import SearchBar from "@/components/SearchBar";
import { useState } from "react";

export default function Home() {
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 overflow-x-hidden">
      {/* ================= HERO SECTION ================= */}
      <motion.section
        className="relative flex flex-col items-center justify-center text-center py-20 sm:py-28 px-4 sm:px-6
                   bg-[url('/crane-bg.png')] bg-cover bg-center bg-no-repeat
                   before:absolute before:inset-0 before:bg-gradient-to-b before:from-black/70 before:via-black/50 before:to-black/80 before:-z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Heading */}
        <motion.h1
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg px-2 sm:px-4"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          Rent Heavy Equipment <br />
          <span className="text-blue-400">Fast, Easy & Reliable</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-8 leading-relaxed px-3 sm:px-4"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          From excavators to cranes — we provide verified machines and trusted
          vendors across India for your construction projects.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="w-full max-w-5xl px-3 sm:px-4"
        >
          {/* Mobile Search */}
          <div className="block sm:hidden">
            <SearchBar />
          </div>
          {/* Desktop Search */}
          <div className="hidden sm:block">
            <SearchBar />
          </div>
        </motion.div>

        {/* Explore Button */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          <Link
            href="/equipments"
            className="inline-block bg-[#14213D] hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-lg shadow-md font-semibold text-base sm:text-lg mt-8 sm:mt-10 transition-all duration-300"
          >
            Explore Equipments →
          </Link>
        </motion.div>
      </motion.section>

      {/* ================= HOW IT WORKS ================= */}
      <motion.section
        className="py-16 sm:py-20 bg-gray-50 text-center px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-12 text-[#14213D]">
          How It Works
        </h2>

        <div className="max-w-5xl mx-auto grid gap-8 sm:gap-10 sm:grid-cols-2 md:grid-cols-3">
          <AnimatedStep
            step="1"
            title="Browse Equipments"
            desc="Explore our wide range of verified machines — cranes, bulldozers, mixers, and more."
          />
          <AnimatedStep
            step="2"
            title="Book Instantly"
            desc="Select duration, location, and confirm your booking securely online in just a few clicks."
          />
          <AnimatedStep
            step="3"
            title="Get Delivered"
            desc="Our trusted vendors deliver your equipment on-site and ready for use — right on schedule."
          />
        </div>
      </motion.section>

      {/* ================= POPULAR CATEGORIES ================= */}
      <motion.section
        className="py-16 sm:py-20 bg-white text-center px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-10 text-[#14213D]">
          Popular Categories
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            { name: "Excavators", img: "/excavator.jpg" },
            { name: "Cranes", img: "/crane.jpg" },
            { name: "Bulldozers", img: "/bulldozer.webp" },
            { name: "Concrete Mixers", img: "/mixer.jpeg" },
            { name: "Dump Trucks", img: "/truck.webp" },
            { name: "Loaders", img: "/loader.jpg" },
          ].map((cat, i) => (
            <motion.div
              key={cat.name}
              className="rounded-lg overflow-hidden shadow-lg bg-gray-100 hover:shadow-2xl transition duration-300 transform hover:-translate-y-1"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div
                className="h-44 sm:h-52 bg-cover bg-center"
                style={{ backgroundImage: `url(${cat.img})` }}
              />
              <h3 className="text-lg sm:text-xl font-semibold py-4 text-gray-800">
                {cat.name}
              </h3>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ================= WHY CHOOSE US ================= */}
      <motion.section
        className="py-16 sm:py-20 bg-gray-50 text-center px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-12 text-[#14213D]">
          Why Choose HeavyEquip?
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <AnimatedFeature
            icon="🚚"
            title="Fast Delivery"
            desc="Reliable delivery right at your site — anywhere in India."
          />
          <AnimatedFeature
            icon="💰"
            title="Transparent Pricing"
            desc="No hidden fees — what you see is what you pay."
          />
          <AnimatedFeature
            icon="🛠️"
            title="Verified Machines"
            desc="All equipments are inspected and vendor-certified."
          />
          <AnimatedFeature
            icon="📞"
            title="24×7 Support"
            desc="We're always here to assist you with your rental journey."
          />
        </div>
      </motion.section>

      {/* ================= CTA BANNER ================= */}
<motion.section
  className="py-16 sm:py-20 bg-[#14213D] text-center text-white px-4"
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
>
  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
    Ready to Get Started?
  </h2>
  <p className="text-gray-300 mb-10 text-sm sm:text-base max-w-xl mx-auto">
    Find the perfect equipment for your project or become a vendor today.
  </p>

  <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
    {/* Book Equipments Button */}
    <Link
      href="/equipments"
      className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
    >
      Book Equipments →
    </Link>

    {/* Become Vendor Button */}
    <Link
      href="/signup" // change this to your vendor register route if different
      className="inline-block border border-blue-400 hover:border-blue-600 text-blue-400 hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-all duration-300"
    >
      Become a Vendor
    </Link>
  </div>
</motion.section>

    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */
function AnimatedStep({ step, title, desc }) {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <motion.div
      className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition transform hover:-translate-y-1"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
        {step}
      </div>
      <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[#14213D]">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
        {desc}
      </p>
    </motion.div>
  );
}

function AnimatedFeature({ icon, title, desc }) {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <motion.div
      className="bg-white p-6 rounded-lg shadow hover:shadow-xl transition transform hover:-translate-y-1 text-center"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="text-3xl sm:text-4xl mb-4">{icon}</div>
      <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[#14213D]">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
        {desc}
      </p>
    </motion.div>
  );
}
