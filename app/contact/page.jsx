"use client";
import { motion } from "framer-motion";

export default function Contact() {
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
          Contact <span className="text-blue-400">HeavyEquip</span>
        </h1>
        <p className="text-lg text-gray-200 max-w-2xl mx-auto">
          We’re here to help with any questions, bookings, or partnership
          opportunities. Reach out to us anytime — we’d love to hear from you.
        </p>
      </motion.section>

      {/* ===== CONTACT INFO ===== */}
      <motion.section
        className="py-20 max-w-6xl mx-auto px-6 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-[#14213D]">
          Get In Touch
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <ContactCard
            icon="📞"
            title="Phone"
            value="+91 98765 43210"
            link="tel:+919876543210"
          />
          <ContactCard
            icon="📧"
            title="Email"
            value="support@heavyequip.com"
            link="mailto:support@heavyequip.com"
          />
          <ContactCard
            icon="📍"
            title="Office"
            value="Mumbai, Maharashtra, India"
          />
        </div>
      </motion.section>

      {/* ===== CONTACT FORM ===== */}
      <motion.section
        className="bg-white py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-10 text-center text-[#14213D]">
          Send Us a Message
        </h2>

        <form className="max-w-3xl mx-auto bg-gray-50 shadow-lg rounded-xl p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-gray-700 font-semibold">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-700 font-semibold">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-gray-700 font-semibold">
              Subject
            </label>
            <input
              type="text"
              placeholder="Inquiry about equipment..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-700 font-semibold">
              Message
            </label>
            <textarea
              placeholder="Write your message here..."
              rows="5"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-600 outline-none"
            ></textarea>
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-[#14213D] hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Send Message →
            </button>
          </div>
        </form>
      </motion.section>

      {/* ===== MAP / CTA ===== */}
      <motion.section
        className="py-20 bg-[#14213D] text-white text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Visit Our Office
        </h2>
        <p className="text-gray-300 mb-8">
          We’re open Monday to Saturday — 9:00 AM to 6:00 PM
        </p>
        <div className="max-w-4xl mx-auto">
          <iframe
            title="HeavyEquip Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.5100269480313!2d72.8776555748941!3d19.07609098708151!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6307a111111%3A0x9b3d4f4e2dc32f0!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            width="100%"
            height="300"
            style={{ border: 0, borderRadius: "12px" }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </motion.section>
    </div>
  );
}

/* ===== SUB COMPONENT ===== */
function ContactCard({ icon, title, value, link }) {
  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition text-center"
      whileHover={{ scale: 1.05 }}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-1 text-[#14213D]">{title}</h3>
      {link ? (
        <a
          href={link}
          className="text-blue-600 hover:underline font-medium"
        >
          {value}
        </a>
      ) : (
        <p className="text-gray-600">{value}</p>
      )}
    </motion.div>
  );
}
