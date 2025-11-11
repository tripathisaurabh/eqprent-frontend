"use client";

export default function TextAreaField({
  label,
  name,
  value,
  icon,
  onChange,
  editable = true,
  placeholder = "",
  rows = 3,
}) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm text-gray-600 mb-1">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-2.5 text-gray-400">{icon}</span>}
        <textarea
          name={name}
          value={value || ""}
          onChange={onChange}
          readOnly={!editable}
          placeholder={placeholder}
          rows={rows}
          className={`w-full border rounded-md p-2 pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            editable
              ? "border-gray-300 bg-white text-gray-800"
              : "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
          }`}
        />
      </div>
    </div>
  );
}
