import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, MapPin, Navigation, Check, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import {
  selectCity,
  closeCityModal,
  fetchCities,
} from '../../store/slices/citySlice.js';
import { toast } from '../../utils/toast.js';

// Landmark SVG line-art icons for the 10 major cities
const CityIcons = {
  Mumbai: () => (
    <svg viewBox="0 0 48 48" className="w-9 h-9 stroke-current fill-none stroke-[1.75]" strokeLinecap="round" strokeLinejoin="round">
      {/* Gateway of India */}
      <path d="M6 42h36M10 42V18l4-4h20l4 4v24" />
      <path d="M19 42V24a5 5 0 0 1 10 0v18" />
      <path d="M10 24h4M34 24h4M10 32h4M34 32h4" />
      <path d="M14 14l2-4h16l2 4" />
      <path d="M22 10V6h4v4" />
      <circle cx="24" cy="18" r="1.5" className="fill-current" />
    </svg>
  ),
  'Delhi-NCR': () => (
    <svg viewBox="0 0 48 48" className="w-9 h-9 stroke-current fill-none stroke-[1.75]" strokeLinecap="round" strokeLinejoin="round">
      {/* India Gate */}
      <path d="M8 42h32M12 42V16l3-4h18l3 4v26" />
      <path d="M18 42V26a6 6 0 0 1 12 0v16" />
      <path d="M12 22h6M30 22h6" />
      <path d="M15 12h18v-3H15v3z" />
      <path d="M20 9V6h8v3" />
    </svg>
  ),
  Bengaluru: () => (
    <svg viewBox="0 0 48 48" className="w-9 h-9 stroke-current fill-none stroke-[1.75]" strokeLinecap="round" strokeLinejoin="round">
      {/* Vidhana Soudha */}
      <path d="M6 42h36M10 42V24l3-3h22l3 3v18" />
      <path d="M18 42V30h12v12" />
      <path d="M20 21V15a4 4 0 0 1 8 0v6" />
      <path d="M24 11V7" />
      <path d="M14 26h4v6h-4zM30 26h4v6h-4z" />
    </svg>
  ),
  Hyderabad: () => (
    <svg viewBox="0 0 48 48" className="w-9 h-9 stroke-current fill-none stroke-[1.75]" strokeLinecap="round" strokeLinejoin="round">
      {/* Charminar */}
      <path d="M8 42h32M10 42V12l2-4h2l2 4v28M32 42V12l2-4h2l2 4v28" />
      <path d="M16 26h16M16 34h16" />
      <path d="M19 42V30a5 5 0 0 1 10 0v12" />
      <path d="M20 26V18a4 4 0 0 1 8 0v8" />
      <path d="M24 14V9" />
    </svg>
  ),
  Ahmedabad: () => (
    <svg viewBox="0 0 48 48" className="w-9 h-9 stroke-current fill-none stroke-[1.75]" strokeLinecap="round" strokeLinejoin="round">
      {/* Sidi Saiyyed / Tree of Life Jali */}
      <path d="M8 42h32M10 42V20a14 14 0 0 1 28 0v22" />
      <path d="M24 42V24" />
      <path d="M24 30c-4-2-6-6-6-10M24 34c5-2 7-6 7-10M24 24c-2-3-2-6 0-8 2 2 2 5 0 8z" />
    </svg>
  ),
  Chandigarh: () => (
    <svg viewBox="0 0 48 48" className="w-9 h-9 stroke-current fill-none stroke-[1.75]" strokeLinecap="round" strokeLinejoin="round">
      {/* Open Hand Monument */}
      <path d="M12 42h24M24 42V28" />
      <path d="M18 28l-4-6a3 3 0 0 1 5-3l5 4V10a3 3 0 0 1 6 0v11l3-2a3 3 0 0 1 4 4l-5 8z" />
    </svg>
  ),
  Chennai: () => (
    <svg viewBox="0 0 48 48" className="w-9 h-9 stroke-current fill-none stroke-[1.75]" strokeLinecap="round" strokeLinejoin="round">
      {/* Temple Gopuram */}
      <path d="M8 42h32M12 42l2-8h20l2 8" />
      <path d="M14 34l2-8h16l2 8" />
      <path d="M16 26l2-8h12l2 8" />
      <path d="M18 18l2-6h8l2 6" />
      <path d="M20 12l4-4 4 4" />
      <path d="M20 42v-5a4 4 0 0 1 8 0v5" />
    </svg>
  ),
  Pune: () => (
    <svg viewBox="0 0 48 48" className="w-9 h-9 stroke-current fill-none stroke-[1.75]" strokeLinecap="round" strokeLinejoin="round">
      {/* Shaniwar Wada Fort Gate */}
      <path d="M6 42h36M10 42V18l4-2v26M34 42V18l4-2v26" />
      <path d="M14 24h20v18H14z" />
      <path d="M19 42V31a5 5 0 0 1 10 0v11" />
      <path d="M12 16l-2-4h8l-2 4M36 16l-2-4h8l-2 4" />
      <path d="M14 18h20" />
    </svg>
  ),
  Kolkata: () => (
    <svg viewBox="0 0 48 48" className="w-9 h-9 stroke-current fill-none stroke-[1.75]" strokeLinecap="round" strokeLinejoin="round">
      {/* Howrah Bridge */}
      <path d="M4 38h40M4 34c12-8 28-8 40 0" />
      <path d="M12 38V14l4 4v20M32 38V14l4 4v20" />
      <path d="M12 22l20-8M32 22L12 14" />
      <path d="M16 26l8-3 8 3" />
      <path d="M4 42h40" />
    </svg>
  ),
  Kochi: () => (
    <svg viewBox="0 0 48 48" className="w-9 h-9 stroke-current fill-none stroke-[1.75]" strokeLinecap="round" strokeLinejoin="round">
      {/* Chinese Fishing Nets */}
      <path d="M6 42h36M8 38c6-2 14-2 20 0" />
      <path d="M12 42L28 14M28 14l12 18M28 14V8" />
      <path d="M28 22l14 8M18 30l16-6" />
      <circle cx="28" cy="8" r="2" />
    </svg>
  ),
};

const POPULAR_CITIES = [
  { name: 'Mumbai', coords: { lat: 19.076, lon: 72.8777 } },
  { name: 'Delhi-NCR', coords: { lat: 28.6139, lon: 77.209 } },
  { name: 'Bengaluru', coords: { lat: 12.9716, lon: 77.5946 } },
  { name: 'Hyderabad', coords: { lat: 17.385, lon: 78.4867 } },
  { name: 'Ahmedabad', coords: { lat: 23.0225, lon: 72.5714 } },
  { name: 'Chandigarh', coords: { lat: 30.7333, lon: 76.7794 } },
  { name: 'Chennai', coords: { lat: 13.0827, lon: 80.2707 } },
  { name: 'Pune', coords: { lat: 18.5204, lon: 73.8567 } },
  { name: 'Kolkata', coords: { lat: 22.5726, lon: 88.3639 } },
  { name: 'Kochi', coords: { lat: 9.9312, lon: 76.2673 } },
];

export const CityModal = () => {
  const [search, setSearch] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [showAllCities, setShowAllCities] = useState(false);
  const dispatch = useDispatch();

  const { selected, list, modalOpen } = useSelector((state) => state.city);

  // Fetch cities list on mount
  useEffect(() => {
    dispatch(fetchCities());
  }, [dispatch]);

  // Combine popular and API cities into distinct list
  const popularNames = POPULAR_CITIES.map((c) => c.name);
  const allCities = Array.from(new Set([...popularNames, ...list])).sort((a, b) =>
    a.localeCompare(b)
  );

  const filteredCities = allCities.filter((city) =>
    city.toLowerCase().includes(search.toLowerCase().trim())
  );

  const isBlocking = !selected; // Spec C3, C5: blocking on first visit

  const handleCityPick = (cityName) => {
    dispatch(selectCity(cityName));
  };

  // Geolocation detection handler
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Calculate closest city by Euclidean distance squared
        let closestCity = POPULAR_CITIES[0].name;
        let minDistance = Infinity;

        POPULAR_CITIES.forEach((city) => {
          const dLat = latitude - city.coords.lat;
          const dLon = longitude - city.coords.lon;
          const dist = dLat * dLat + dLon * dLon;
          if (dist < minDistance) {
            minDistance = dist;
            closestCity = city.name;
          }
        });

        setDetecting(false);
        handleCityPick(closestCity);
        toast.success(`Location detected: ${closestCity}`);
      },
      (err) => {
        setDetecting(false);
        // Fallback default city gracefully
        if (!selected) {
          handleCityPick('Mumbai');
        }
        toast.error('Could not detect location. Please select your city manually.');
      },
      { timeout: 7000, enableHighAccuracy: false }
    );
  };

  return (
    <Modal
      isOpen={modalOpen}
      onClose={() => dispatch(closeCityModal())}
      title="Select Your City"
      maxWidth="max-w-2xl"
      blocking={isBlocking}
      showCloseButton={!isBlocking}
    >
      <div className="space-y-6">
        {/* City Search Bar & Detect Location Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for your city (e.g. Mumbai, Bengaluru)..."
              className="w-full h-11 pl-10 pr-4 text-sm bg-gray-50 border border-border rounded-xs focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-ink transition-all"
              autoFocus
            />
          </div>

          {/* Detect Location Button with animated pulse */}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={detecting}
            className="flex items-center justify-center gap-2 h-11 px-4 text-xs font-semibold text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 rounded-xs transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            {detecting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            ) : (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
            )}
            <Navigation className="w-3.5 h-3.5" />
            <span>Detect my location</span>
          </button>
        </div>

        {/* Popular Cities Grid (10 Cities with Custom Landmark Line-Art) */}
        <div>
          <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
            Popular Cities
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {POPULAR_CITIES.map((city) => {
              const isSelected = selected === city.name;
              const IconComponent = CityIcons[city.name] || CityIcons.Mumbai;

              return (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => handleCityPick(city.name)}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-md border text-center transition-all cursor-pointer group ${
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary font-bold shadow-xs ring-1 ring-primary'
                      : 'border-border bg-white hover:border-primary/50 hover:bg-gray-50/80 text-ink'
                  }`}
                >
                  {/* Selected checkmark indicator */}
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}

                  {/* Landmark Line-Art Icon */}
                  <div
                    className={`transition-transform duration-200 group-hover:scale-110 mb-2 ${
                      isSelected ? 'text-primary' : 'text-gray-500 group-hover:text-primary'
                    }`}
                  >
                    <IconComponent />
                  </div>

                  <span className="text-xs font-semibold tracking-tight truncate max-w-full">
                    {city.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapsible "View All Cities" Alphabetical List */}
        <div className="pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setShowAllCities(!showAllCities)}
            className="w-full flex items-center justify-between text-xs font-bold text-ink hover:text-primary transition-colors py-2 cursor-pointer"
          >
            <span>View All Cities ({allCities.length})</span>
            {showAllCities ? (
              <ChevronUp className="w-4 h-4 text-muted" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted" />
            )}
          </button>

          {(showAllCities || search.trim().length > 0) && (
            <div className="mt-3 max-h-56 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filteredCities.map((city) => {
                const isSelected = selected === city;
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleCityPick(city)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-xs text-left transition-colors cursor-pointer truncate ${
                      isSelected
                        ? 'text-primary font-bold bg-primary/10'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-ink'
                    }`}
                  >
                    <MapPin className="w-3 h-3 flex-shrink-0 text-muted" />
                    <span className="truncate">{city}</span>
                  </button>
                );
              })}
            </div>
          )}

          {filteredCities.length === 0 && (
            <p className="text-xs text-center text-muted py-6">
              No cities match "{search}"
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CityModal;
