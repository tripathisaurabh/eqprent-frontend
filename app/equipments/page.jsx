"use client";
import { Suspense } from "react";
import EquipmentsContent from "./EquipmentsContent";

export default function EquipmentsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading equipments...</div>}>
      <EquipmentsContent />
    </Suspense>
  );
}
