import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-12">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-xl font-semibold text-white mb-3">
          HeavyEquip Rentals
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Reliable, affordable, and fast equipment rentals for every need.
        </p>

        <div className="flex justify-center space-x-6 text-sm mb-6">
          <Link href="/about" className="hover:text-blue-400 transition">
            About
          </Link>
          <Link href="/contact" className="hover:text-blue-400 transition">
            Contact
          </Link>
          <Link href="/terms" className="hover:text-blue-400 transition">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-blue-400 transition">
            Privacy
          </Link>
        </div>

        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} HeavyEquip Rentals. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
