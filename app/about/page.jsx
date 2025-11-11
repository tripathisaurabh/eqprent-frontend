"use client";
import { motion } from "framer-motion";

export default function About() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800">
      
      {/* ===== HERO SECTION ===== */}
      <motion.section
        className="relative text-center py-24 px-6 bg-[url('/crane-bg.jpg')] bg-cover bg-center bg-no-repeat before:absolute before:inset-0 before:bg-black/60 before:-z-10"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <h1 className="text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
          About <span className="text-blue-400">HeavyEquip</span>
        </h1>
        <p className="text-lg text-gray-200 max-w-2xl mx-auto">
          We’re building India’s most trusted platform for renting heavy
          machinery — connecting verified vendors with builders, contractors,
          and industries nationwide.
        </p>
      </motion.section>

      {/* ===== OUR STORY ===== */}
      <motion.section
        className="py-20 max-w-5xl mx-auto px-6 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-[#14213D]">
          Our Story
        </h2>
        <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto">
          Founded with a vision to make heavy equipment rentals transparent and
          accessible, <span className="font-semibold text-gray-800">HeavyEquip</span> started as a small initiative to
          simplify the complex, fragmented rental market. Today, we connect
          hundreds of verified equipment owners with contractors and builders
          across multiple cities — providing real-time availability, fair
          pricing, and reliable delivery.
        </p>
      </motion.section>

      {/* ===== MISSION & VALUES ===== */}
      <motion.section
        className="bg-white py-20 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-10 text-[#14213D]">
          Our Mission & Core Values
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
          <ValueCard
            icon="🤝"
            title="Trust & Transparency"
            desc="We ensure every transaction is honest, clear, and fair — no hidden costs or surprises."
          />
          <ValueCard
            icon="⚙️"
            title="Operational Excellence"
            desc="We partner only with verified vendors who maintain high operational and safety standards."
          />
          <ValueCard
            icon="🚀"
            title="Innovation at Core"
            desc="We leverage technology to simplify equipment access, automate logistics, and optimize rentals."
          />
          <ValueCard
            icon="💡"
            title="Customer First"
            desc="We listen, adapt, and continuously improve based on user feedback and market needs."
          />
          <ValueCard
            icon="🌍"
            title="Sustainability"
            desc="Promoting shared use of machinery reduces waste and supports sustainable growth."
          />
          <ValueCard
            icon="📞"
            title="Always Available"
            desc="24/7 customer support — ensuring smooth and reliable service for all clients."
          />
        </div>
      </motion.section>

      {/* ===== WHY WE STAND OUT ===== */}
      <motion.section
        className="py-20 text-center max-w-6xl mx-auto px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-[#14213D]">
          Why We Stand Out
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
          HeavyEquip isn’t just a rental service — it’s a reliability network.
          Every vendor and equipment listed on our platform undergoes quality
          checks and operational validation. We handle the hard part, so your
          projects run on time, within budget, and without delays.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <Highlight
            title="Verified Vendors"
            desc="All our vendors go through strict background and performance checks."
          />
          <Highlight
            title="Nationwide Coverage"
            desc="We’re expanding to serve builders and contractors in every major city."
          />
          <Highlight
            title="Tech-Driven Platform"
            desc="Real-time availability, cost optimization, and seamless booking via one platform."
          />
        </div>
      </motion.section>

      {/* ===== CTA ===== */}
      <motion.section
        className="bg-[#14213D] text-center text-white py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <h2 className="text-4xl font-bold mb-6">Join the HeavyEquip Network</h2>
        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
          Whether you’re a vendor or a contractor — HeavyEquip is here to help
          you grow faster and build smarter.
        </p>
        <a
          href="/contact"
          className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg text-white font-semibold transition"
        >
          Get in Touch →
        </a>
      </motion.section>
    </div>
  );
}

/* ===== REUSABLE SUBCOMPONENTS ===== */

function ValueCard({ icon, title, desc }) {
  return (
    <motion.div
      className="p-6 bg-gray-50 rounded-lg shadow hover:shadow-xl transition"
      whileHover={{ scale: 1.03 }}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-[#14213D]">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </motion.div>
  );
}

function Highlight({ title, desc }) {
  return (
    <motion.div
      className="p-6 bg-white rounded-lg shadow hover:shadow-xl transition"
      whileHover={{ scale: 1.03 }}
    >
      <h3 className="text-xl font-semibold mb-2 text-[#14213D]">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </motion.div>
  );
}
