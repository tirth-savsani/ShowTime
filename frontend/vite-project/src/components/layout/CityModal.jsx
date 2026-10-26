import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, MapPin } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import {
  selectCity,
  closeCityModal,
  fetchCities,
} from '../../store/slices/citySlice.js';

const POPULAR_CITIES = [
  'Bengaluru',
  'Mumbai',
  'Delhi NCR',
  'Hyderabad',
  'Chennai',
  'Kolkata',
];

export const CityModal = () => {
  const [search, setSearch] = useState('');
  const dispatch = useDispatch();

  const { selected, list, modalOpen } = useSelector((state) => state.city);

  // Fetch cities list on mount
  useEffect(() => {
    dispatch(fetchCities());
  }, [dispatch]);

  // Combine popular and API cities into distinct list
  const allCities = Array.from(new Set([...list, ...POPULAR_CITIES]));

  const filteredCities = allCities.filter((city) =>
    city.toLowerCase().includes(search.toLowerCase().trim())
  );

  const isBlocking = !selected; // Spec C3, C5: blocking on first visit

  const handleCityPick = (cityName) => {
    dispatch(selectCity(cityName));
  };

  return (
    <Modal
      isOpen={modalOpen}
      onClose={() => dispatch(closeCityModal())}
      title="Select Your City"
      maxWidth="max-w-2xl" // Spec C4: 720px width
      blocking={isBlocking}
      showCloseButton={!isBlocking}
    >
      <div className="space-y-6">
        {/* City Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for your city..."
            className="w-full h-11 pl-10 pr-4 text-sm bg-gray-50 border border-border rounded-xs focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-ink transition-all"
            autoFocus
          />
        </div>

        {/* Popular Cities Grid */}
        <div>
          <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
            Popular Cities
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {POPULAR_CITIES.map((city) => {
              const isSelected = selected === city;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleCityPick(city)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xs border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary font-bold shadow-xs'
                      : 'border-border bg-white hover:border-primary/50 hover:bg-gray-50 text-ink'
                  }`}
                >
                  <MapPin
                    className={`w-4 h-4 mb-1.5 ${
                      isSelected ? 'text-primary' : 'text-muted'
                    }`}
                  />
                  <span className="text-xs">{city}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Other Cities Section */}
        {filteredCities.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2.5">
              All Available Cities
            </h4>
            <div className="max-h-48 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleCityPick(city)}
                  className={`text-left px-3 py-2 text-xs rounded-xs transition-colors hover:bg-primary/5 hover:text-primary cursor-pointer truncate ${
                    selected === city
                      ? 'text-primary font-bold bg-primary/5'
                      : 'text-ink'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredCities.length === 0 && (
          <p className="text-sm text-center text-muted py-6">
            No cities match "{search}"
          </p>
        )}
      </div>
    </Modal>
  );
};

export default CityModal;
