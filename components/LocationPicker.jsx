"use client";
import { useState, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";

export default function LocationPicker({ onSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load Maps script once
  // useEffect(() => {
  //   if (window.google?.maps) return;
  //   const s = document.createElement("script");
  //   s.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
  //   s.async = true;
  //   document.head.appendChild(s);
  // }, []);

  const handleInput = (val) => {
    setQuery(val);
    if (!window.google?.maps || val.length < 3) return;
    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions({ input: val, componentRestrictions: { country: "in" } }, (preds, status) => {
      if (status === "OK") setSuggestions(preds);
    });
  };

  const selectSuggestion = (placeId, description) => {
    setQuery(description);
    setSuggestions([]);
    const service = new window.google.maps.places.PlacesService(document.createElement("div"));
    setLoading(true);
    service.getDetails({ placeId }, (place, status) => {
      setLoading(false);
      if (status === "OK" && place.geometry) {
        const pos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address,
        };
        onSelect(pos);
      }
    });
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        placeholder="Enter delivery location"
        onChange={(e) => handleInput(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring focus:ring-blue-100 outline-none"
      />
      {loading && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-blue-600" />}

      {suggestions.length > 0 && (
        <div className="absolute z-50 bg-white border border-gray-200 rounded-md mt-1 shadow-lg max-h-56 overflow-y-auto w-full">
          {suggestions.map((s) => (
            <div
              key={s.place_id}
              onClick={() => selectSuggestion(s.place_id, s.description)}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700"
            >
              {s.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
