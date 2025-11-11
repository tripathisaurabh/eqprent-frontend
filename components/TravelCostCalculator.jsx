"use client";
import { useState, useEffect, useRef } from "react";
import { MapPin, Truck, Navigation, Loader2, AlertCircle } from "lucide-react";

export default function AccurateTransportCalculator({ 
  baseLat, 
  baseLng, 
  perKmRate = 150,
  baseVehicleCharge = 2000 
}) {
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchAddress, setSearchAddress] = useState("");
  const [detectedAddress, setDetectedAddress] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [routeLine, setRouteLine] = useState(null);
  const [apiError, setApiError] = useState(null);
  const mapInitialized = useRef(false);
  const scriptLoaded = useRef(false);

  // Validate and parse coordinates
  const basePos = {
    lat: parseFloat(baseLat) || 19.076,
    lng: parseFloat(baseLng) || 72.8777
  };

  // Validate coordinates
  useEffect(() => {
    if (isNaN(basePos.lat) || isNaN(basePos.lng)) {
      setApiError("Invalid vendor location coordinates");
    }
  }, [baseLat, baseLng]);

  // Initialize map - only once
  useEffect(() => {
    if (mapInitialized.current) return;

  

    // loadGoogleMapsScript();

    return () => {
      // Cleanup markers and route when component unmounts
      markers.forEach(marker => marker?.setMap(null));
      if (routeLine) routeLine.setMap(null);
    };
  }, []);
useEffect(() => {
  if (!window.google || !window.google.maps) return;
  if (mapInitialized.current) return;
  initMap();
}, []);

  const initMap = () => {
    if (mapInitialized.current || !window.google || !window.google.maps) return;
    
    mapInitialized.current = true;

    try {
      const mapElement = document.getElementById("map");
      if (!mapElement) return;

      const googleMap = new window.google.maps.Map(mapElement, {
        center: basePos,
        zoom: 12,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });

      // Base location marker
      const baseMarker = new window.google.maps.Marker({
        position: basePos,
        map: googleMap,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        title: "Equipment Base Location"
      });

      // Add info window for base marker
      const baseInfoWindow = new window.google.maps.InfoWindow({
        content: `<div style="padding:8px"><strong>Equipment Base Location</strong></div>`
      });

      baseMarker.addListener('click', () => {
        baseInfoWindow.open(googleMap, baseMarker);
      });

      setMap(googleMap);
      setMarkers([baseMarker]);

      // Click listener for manual selection
      googleMap.addListener('click', (e) => {
        handleMapClick(e.latLng);
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      setApiError("Error initializing map. Please refresh the page.");
    }
  };

  // Get user's current location
  const getUserCurrentLocation = () => {
    setLoading(true);
    setApiError(null);
    
    if (!navigator.geolocation) {
      setApiError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(pos);
        updateDestinationMarker(pos);
        reverseGeocode(pos);
        if (map) map.setCenter(pos);
        setLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setApiError("Unable to get your location. Please check location permissions or enter address manually.");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Search address using Google Places API
  const searchLocation = async () => {
    if (!searchAddress.trim()) {
      setApiError("Please enter an address");
      return;
    }

    if (!window.google) {
      setApiError("Google Maps not loaded yet. Please wait...");
      return;
    }

    setLoading(true);
    setApiError(null);
    
    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ 
      address: searchAddress,
      componentRestrictions: { country: 'IN' }
    }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        const pos = { lat: location.lat(), lng: location.lng() };
        setUserLocation(pos);
        setDetectedAddress(results[0].formatted_address);
        updateDestinationMarker(pos);
        if (map) {
          map.setCenter(pos);
          map.setZoom(14);
        }
      } else {
        setApiError("Location not found. Please try a different address or pincode.");
      }
      setLoading(false);
    });
  };

  // Autocomplete suggestions
  const handleSearchInput = (value) => {
    setSearchAddress(value);
    
    if (value.length > 2 && window.google && window.google.maps) {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        { 
          input: value,
          componentRestrictions: { country: 'in' }
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
          } else {
            setSuggestions([]);
          }
        }
      );
    } else {
      setSuggestions([]);
    }
  };

  // Select from suggestions
  const selectSuggestion = (placeId, description) => {
    setSearchAddress(description);
    setSuggestions([]);
    
    if (!map) return;
    
    const service = new window.google.maps.places.PlacesService(map);
    service.getDetails({ placeId }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
        const pos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setUserLocation(pos);
        setDetectedAddress(place.formatted_address);
        updateDestinationMarker(pos);
        map.setCenter(pos);
        map.setZoom(14);
      }
    });
  };

  // Handle map click
  const handleMapClick = (latLng) => {
    const pos = { lat: latLng.lat(), lng: latLng.lng() };
    setUserLocation(pos);
    updateDestinationMarker(pos);
    reverseGeocode(pos);
  };

  // Reverse geocode to get address
  const reverseGeocode = (pos) => {
    if (!window.google) return;
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: pos }, (results, status) => {
      if (status === "OK" && results[0]) {
        setDetectedAddress(results[0].formatted_address);
        setSearchAddress(results[0].formatted_address);
      }
    });
  };

  // Update destination marker
  const updateDestinationMarker = (pos) => {
    if (!map) return;

    // Remove previous destination marker if exists
    if (markers.length > 1) {
      markers[1].setMap(null);
    }

    const destMarker = new window.google.maps.Marker({
      position: pos,
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#EA4335",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
      title: "Delivery Location",
      animation: window.google.maps.Animation.DROP
    });

    const destInfoWindow = new window.google.maps.InfoWindow({
      content: `<div style="padding:8px"><strong>Delivery Location</strong></div>`
    });

    destMarker.addListener('click', () => {
      destInfoWindow.open(map, destMarker);
    });

    setMarkers([markers[0], destMarker]);
  };

  // Calculate actual road distance and cost
  const calculateRoadDistance = () => {
    if (!userLocation) {
      setApiError("Please select a delivery location first.");
      return;
    }

    if (!window.google) {
      setApiError("Google Maps not loaded. Please refresh the page.");
      return;
    }

    setLoading(true);
    setApiError(null);
    
    const service = new window.google.maps.DistanceMatrixService();
    
    service.getDistanceMatrix(
      {
        origins: [basePos],
        destinations: [userLocation],
        travelMode: 'DRIVING',
        unitSystem: window.google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
      },
      (response, status) => {
        setLoading(false);
        
        if (status === 'OK') {
          const result = response.rows[0].elements[0];
          
          if (result.status === 'OK') {
            const distanceKm = result.distance.value / 1000;
            const duration = result.duration.text;
            const transportCost = distanceKm * perKmRate;
            const totalCost = baseVehicleCharge + transportCost;

            setResult({
              distance: distanceKm.toFixed(2),
              duration: duration,
              transportCost: transportCost.toFixed(2),
              baseCharge: baseVehicleCharge.toFixed(2),
              total: totalCost.toFixed(2)
            });
            localStorage.setItem("latestTravelCost", totalCost.toFixed(2));

            drawRoute();
          } else if (result.status === 'ZERO_RESULTS') {
            setApiError("No route found between these locations. Please try a different destination.");
          } else {
            setApiError("Could not calculate route. Please try again.");
          }
        } else {
          setApiError("Error calculating distance. Please check your internet connection and try again.");
        }
      }
    );
  };

  // Draw route on map
  const drawRoute = () => {
    if (!map || !window.google) return;

    // Remove previous route
    if (routeLine) {
      routeLine.setMap(null);
    }

    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#4285F4",
        strokeWeight: 5,
        strokeOpacity: 0.8
      }
    });

    directionsService.route(
      {
        origin: basePos,
        destination: userLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
        avoidHighways: false,
        avoidTolls: false,
      },
      (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
          setRouteLine(directionsRenderer);
        }
      }
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Truck className="h-7 w-7" />
          Heavy Equipment Transport Calculator
        </h2>
        <p className="text-blue-100 mt-2">Calculate accurate transport costs based on actual road distance</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Error Alert */}
        {apiError && (
          <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-800">{apiError}</p>
            </div>
          </div>
        )}

        {/* Location Input Section */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={getUserCurrentLocation}
              disabled={loading || !map}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
              Use My Location
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Enter delivery address, pincode, or landmark..."
              value={searchAddress}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={searchLocation}
              disabled={loading || !map || !searchAddress.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Search
            </button>

            {/* Autocomplete Suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.place_id}
                    onClick={() => selectSuggestion(suggestion.place_id, suggestion.description)}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <p className="text-sm text-gray-800">{suggestion.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {detectedAddress && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-blue-900">Selected Location:</p>
                <p className="text-sm text-blue-800">{detectedAddress}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Click anywhere on the map to set your exact delivery location
            </p>
          </div>
        </div>

        {/* Map */}
        <div id="map" className="w-full h-96 rounded-lg border-2 border-gray-300 shadow-inner bg-gray-100"></div>

        {/* Calculate Button */}
        <button
          onClick={calculateRoadDistance}
          disabled={!userLocation || loading || !map}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Truck className="h-5 w-5" />
              Calculate Transport Cost
            </>
          )}
        </button>

        {/* Results */}
        {result && (
          <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Cost Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                <span className="text-gray-700">Road Distance:</span>
                <span className="font-semibold text-gray-900">{result.distance} km</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                <span className="text-gray-700">Estimated Duration:</span>
                <span className="font-semibold text-gray-900">{result.duration}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                <span className="text-gray-700">Base Vehicle Charge:</span>
                <span className="font-semibold text-gray-900">₹{result.baseCharge}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                <span className="text-gray-700">Transport Cost (₹{perKmRate}/km):</span>
                <span className="font-semibold text-gray-900">₹{result.transportCost}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-gray-900">Total Cost:</span>
                <span className="text-2xl font-bold text-green-700">₹{result.total}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}