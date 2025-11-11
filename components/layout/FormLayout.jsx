"use client";

import { motion } from "framer-motion";

/**
 * Universal form layout wrapper for all major forms (Profile, Booking, Equipment, etc.)
 *
 * Props:
 * - title: string (form title)
 * - subtitle?: string (optional small text below title)
 * - icon?: ReactNode (Lucide or custom icon)
 * - children: ReactNode (your actual form)
 * - onSubmit?: function (optional form submit)
 * - showFooter?: boolean (adds Save/Cancel area)
 * - footerContent?: ReactNode (custom footer buttons)
 */
export default function FormLayout({
  title,
  subtitle,
  icon,
  children,
  onSubmit,
  showFooter = false,
  footerContent = null,
}) {
  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-6">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-gray-100"
      >
        {/* Header */}
        <div className="flex items-center mb-6">
          {icon && <span className="text-blue-600 w-8 h-8 mr-3">{icon}</span>}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit || ((e) => e.preventDefault())}>
          <div className="space-y-6">{children}</div>

          {/* Footer */}
          {showFooter && (
            <div className="mt-8 flex justify-end gap-4 border-t border-gray-100 pt-6">
              {footerContent || (
                <>
                  <button
                    type="button"
                    className="px-5 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                  >
                    Save Changes
                  </button>
                </>
              )}
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
