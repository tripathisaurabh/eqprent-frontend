"use client";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";

export default function SupportPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-24 sm:pt-28">
      {/* ===== HEADER ===== */}
      <section className="bg-[#14213D] text-white py-16 sm:py-20 text-center px-4">
        <motion.h1
          className="text-3xl sm:text-5xl font-bold mb-4"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          Need Help? We’re Here for You
        </motion.h1>
        <motion.p
          className="text-gray-200 max-w-2xl mx-auto text-sm sm:text-base"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          Whether you have questions about your booking, payments, or vendor
          details — our support team is ready to assist you.
        </motion.p>
      </section>

      {/* ===== SUPPORT DETAILS ===== */}
      <section className="flex-1 py-16 sm:py-20 bg-white px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <Phone className="text-blue-600 h-10 w-10 mb-3" />
            <h3 className="text-xl font-semibold text-[#14213D] mb-2">Call Us</h3>
            <p className="text-gray-700 mb-1">📞 +91 98765 43210</p>
            <p className="text-gray-700 mb-1">📞 +91 91234 56789</p>
            <p className="text-gray-500 text-sm">Available 9 AM – 7 PM</p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <Mail className="text-blue-600 h-10 w-10 mb-3" />
            <h3 className="text-xl font-semibold text-[#14213D] mb-2">
              Email Support
            </h3>
            <p className="text-gray-700 mb-1">📧 support@heavyequip.com</p>
            <p className="text-gray-700 mb-1">📧 helpdesk@heavyequip.com</p>
            <p className="text-gray-500 text-sm">24×7 Email Assistance</p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <MapPin className="text-blue-600 h-10 w-10 mb-3" />
            <h3 className="text-xl font-semibold text-[#14213D] mb-2">Visit Us</h3>
            <p className="text-gray-700 mb-1">Office No. 203, HeavyEquip HQ</p>
            <p className="text-gray-700 mb-1">
              Kurla West, Mumbai – 400070, India
            </p>
            <p className="text-gray-500 text-sm">Mon–Sat | 9 AM – 6 PM</p>
          </motion.div>
        </div>
      </section>

      {/* ===== CONTACT FORM ===== */}
      <section className="py-12 bg-gray-50 px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg border"
        >
          <h2 className="text-2xl font-semibold text-[#14213D] mb-6 text-center">
            Send Us a Message
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("✅ Message submitted! Our support team will get back soon.");
              e.target.reset();
            }}
            className="space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your Name"
                required
                className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
              />
              <input
                type="email"
                placeholder="Your Email"
                required
                className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
              />
            </div>
            <input
              type="text"
              placeholder="Subject"
              required
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
            />
            <textarea
              placeholder="Your Message"
              rows={4}
              required
              className="border border-gray-300 rounded-md px-4 py-2 w-full focus:ring-2 focus:ring-blue-100 focus:border-blue-600"
            ></textarea>
            <div className="text-center">
              <button
                type="submit"
                className="bg-[#14213D] hover:bg-blue-800 text-white font-semibold px-8 py-2 rounded-md shadow-md transition"
              >
                Send Message →
              </button>
            </div>
          </form>
        </motion.div>
      </section>
    </div>
  );
}
