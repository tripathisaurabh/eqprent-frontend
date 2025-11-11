import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Script from "next/script";

export const metadata = {
  title: "HeavyEquip Rentals",
  description:
    "Rent premium construction and industrial equipment easily and affordably.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* ✅ Global Navbar */}
  <Navbar />
  <main className="pt-[80px]">{children}</main> {/* 👈 adds spacing below navbar */}
  <Footer />

        {/* ✅ Google Maps Script (load after page interactive) */}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
