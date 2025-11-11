"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children, allowedRole = "VENDOR" }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token || role !== allowedRole) {
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [router, allowedRole]);

  if (!authorized) return null;
  return children;
}
