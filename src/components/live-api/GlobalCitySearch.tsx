import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe2, Radio, Check, Loader2, MapPin, ExternalLink, RefreshCw, Zap } from 'lucide-react';
import { searchCities, fetchLiveAirQualityByCoordinates, GeocodingResult } from '../../services/liveAqiService';
import { CityStation } from '../../types/aqi';

interface GlobalCitySearchProps {
  onSelectLiveCity: (station: CityStation) => void;
  currentCityName: string;
}

const POPULAR_GLOBAL_CITIES = [
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { name: 'San Francisco', country: 'United States', lat: 37.7749, lng: -122.4194 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777 },
  { name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050 },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.9780 },
  { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357 },
];

export const GlobalCitySearch: React.FC<GlobalCitySearchProps> = ({
  onSelectLiveCity,
  currentCityName,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingCity, setIsLoadingCity] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const cities = await searchCities(query);
      setResults(cities);
      setIsSearching(false);
      setIsOpen(true);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCity = async (name: string, country: string, lat: number, lng: number) => {
    setIsLoadingCity(true);
    setStatusMessage(`Fetching real-time atmospheric sensor readings for ${name}...`);
    setIsOpen(false);
    setQuery('');

    try {
      const liveData = await fetchLiveAirQualityByCoordinates(lat, lng, name, country);

      // Generate 24h synthetic history centered around current live reading
      const history24h = Array.from({ length: 24 }).map((_, i) => {
        const hour = (new Date().getHours() - (23 - i) + 24) % 24;
        const wave = Math.sin((i / 24) * Math.PI * 2) * 12;
        const aqiVal = Math.max(12, Math.round(liveData.environmentalData.pm25 * 2.05 + wave));
        return {
          time: `${String(hour).padStart(2, '0')}:00`,
          aqi: aqiVal,
          pm25: Math.round(liveData.environmentalData.pm25 + Math.sin(hour / 3) * 6),
          pm10: Math.round(liveData.environmentalData.pm10 + Math.sin(hour / 4) * 10),
          o3: Math.round(liveData.environmentalData.o3 + (hour >= 12 && hour <= 17 ? 20 : -5)),
          no2: Math.round(liveData.environmentalData.no2 + Math.cos(hour / 3) * 10),
          temperature: Number((liveData.environmentalData.temperature + Math.sin(hour / 5) * 4).toFixed(1)),
          humidity: Math.round(Math.min(95, Math.max(20, liveData.environmentalData.humidity + Math.cos(hour / 4) * 8))),
          windSpeed: Number((Math.max(0.5, liveData.environmentalData.windSpeed + Math.sin(hour / 4) * 1.2)).toFixed(1)),
        };
      });

      const newStation: CityStation = {
        id: `live_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
        city: name,
        country: country,
        stationName: `Official Sensor Grid (${name}) - ECMWF/OpenAQ`,
        coordinates: { lat, lng },
        current: liveData.environmentalData,
        history24h,
      };

      onSelectLiveCity(newStation);
      setStatusMessage(`Active live feed: ${name}, ${country}`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error('Failed to load city air quality:', err);
      setStatusMessage('Error retrieving live sensor feed. Please retry.');
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setIsLoadingCity(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Search Input Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search any global city (e.g. Paris, Chicago, Singapore)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
          />
          {isSearching && (
            <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin absolute right-3 top-3" />
          )}
        </div>

        {isLoadingCity && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="hidden sm:inline">Connecting API...</span>
          </div>
        )}
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className="mt-1.5 text-xs font-mono text-cyan-400 flex items-center gap-1.5">
          <Radio className="w-3 h-3 animate-pulse" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Dropdown Results & Suggestions */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-md max-h-80 overflow-y-auto">
          {/* Autocomplete Results */}
          {results.length > 0 ? (
            <div className="p-2 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Search Results ({results.length})
              </div>
              {results.map((c) => (
                <button
                  key={`${c.id}_${c.name}`}
                  onClick={() => handleSelectCity(c.name, c.country, c.latitude, c.longitude)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center justify-between text-xs text-slate-200 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="font-semibold text-white">{c.name}</span>
                      {c.admin1 && <span className="text-slate-400">, {c.admin1}</span>}
                      <span className="text-slate-500"> ({c.country})</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 group-hover:text-cyan-400">
                    {c.latitude.toFixed(2)}°, {c.longitude.toFixed(2)}°
                  </span>
                </button>
              ))}
            </div>
          ) : query.length >= 2 && !isSearching ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No cities found matching "{query}". Try a different spelling or larger metro area.
            </div>
          ) : null}

          {/* Quick Popular Picks */}
          <div className="p-2.5 bg-slate-950/80 border-t border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400" />
              1-Click Global Sensor Stations (Open-Meteo & ECMWF Live)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_GLOBAL_CITIES.map((city) => (
                <button
                  key={city.name}
                  onClick={() => handleSelectCity(city.name, city.country, city.lat, city.lng)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    currentCityName === city.name
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  📍 {city.name}, {city.country}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
