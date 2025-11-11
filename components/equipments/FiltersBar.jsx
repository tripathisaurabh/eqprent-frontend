"use client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

const TYPES = ["Excavator","Crane","Bulldozer","Concrete Mixer","Dump Truck","Loader","Other"];
const SORTS = [
  { label: "Newest", value: "created:desc" },
  { label: "Price: Low → High", value: "price:asc" },
  { label: "Price: High → Low", value: "price:desc" },
  { label: "Name A→Z", value: "name:asc" },
  { label: "Name Z→A", value: "name:desc" },
];

export default function FiltersBar({ value, onChange }) {
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  // basic debounced search
  useEffect(() => {
    const t = setTimeout(() => onChange(local), 350);
    return () => clearTimeout(t);
  }, [local]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="grid md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
          <input
            type="text"
            placeholder="Search by name or description"
            value={local.search}
            onChange={(e) => setLocal({ ...local, search: e.target.value, page: 1 })}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={local.type}
          onChange={e => setLocal({ ...local, type: e.target.value || "", page: 1 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={local.minPrice}
            onChange={e => setLocal({ ...local, minPrice: e.target.value, page: 1 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <span>—</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={local.maxPrice}
            onChange={e => setLocal({ ...local, maxPrice: e.target.value, page: 1 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={local.sort}
          onChange={e => setLocal({ ...local, sort: e.target.value, page: 1 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
    </div>
  );
}
