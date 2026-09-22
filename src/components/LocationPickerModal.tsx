import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Navigation,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Compass,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useLocations } from '../hooks/useLocations';
import { CustomPlace } from '../constants/neighborhoods';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation: string;
  onSelectLocation: (location: string) => void;
  allowAll?: boolean; // Show 'All Locations' option (default true)
  title?: string;
}

export function LocationPickerModal({
  isOpen,
  onClose,
  selectedLocation,
  onSelectLocation,
  allowAll = true,
  title = 'Select Your Location',
}: LocationPickerModalProps) {
  const {
    majorCities,
    citiesData,
    customPlaces,
    addPlace,
    editPlace,
    deletePlace,
    detectUserLocation,
    isLocating,
    detectionNotice,
  } = useLocations();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCityTab, setActiveCityTab] = useState<string>('all');
  
  // Custom place form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceCity, setNewPlaceCity] = useState('');

  // Edit custom place state
  const [editingPlace, setEditingPlace] = useState<CustomPlace | null>(null);
  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');

  // Filtered places
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    // Filter custom places
    const matchedCustom = customPlaces.filter((p) => {
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.city && p.city.toLowerCase().includes(q))
      );
    });

    // Filter cities and suburbs
    const matchedCities = citiesData
      .map((group) => {
        if (activeCityTab !== 'all' && group.city.toLowerCase() !== activeCityTab.toLowerCase()) {
          return null;
        }

        const cityMatches = !q || group.city.toLowerCase().includes(q);
        const matchingSuburbs = group.suburbs.filter(
          (suburb) => !q || suburb.toLowerCase().includes(q)
        );

        if (cityMatches || matchingSuburbs.length > 0) {
          return {
            city: group.city,
            suburbs: cityMatches && !q ? group.suburbs : matchingSuburbs,
          };
        }
        return null;
      })
      .filter(Boolean) as { city: string; suburbs: string[] }[];

    return {
      custom: matchedCustom,
      cities: matchedCities,
    };
  }, [searchQuery, activeCityTab, customPlaces, citiesData]);

  const handleAutoDetect = async () => {
    const res = await detectUserLocation();
    if (res) {
      onSelectLocation(res.locationName);
      onClose();
    }
  };

  const handleSaveNewPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceName.trim()) return;

    const created = addPlace(newPlaceName.trim(), newPlaceCity.trim() || undefined);
    setNewPlaceName('');
    setNewPlaceCity('');
    setShowAddForm(false);
    onSelectLocation(created.name);
    onClose();
  };

  const handleStartEdit = (place: CustomPlace, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPlace(place);
    setEditName(place.name);
    setEditCity(place.city || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlace || !editName.trim()) return;

    editPlace(editingPlace.id, editName.trim(), editCity.trim() || undefined);
    if (selectedLocation === editingPlace.name) {
      onSelectLocation(editName.trim());
    }
    setEditingPlace(null);
  };

  const handleDelete = (place: CustomPlace, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Remove custom place "${place.name}"?`)) {
      deletePlace(place.id);
      if (selectedLocation === place.name) {
        onSelectLocation(allowAll ? 'All Locations' : 'Harare');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{title}</h2>
              <p className="text-xs text-gray-500">Find services and tasks close to you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Actions: Auto-detect GPS button */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/70 space-y-3">
          <button
            type="button"
            onClick={handleAutoDetect}
            disabled={isLocating}
            className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-75"
          >
            <Navigation className={`w-4 h-4 text-emerald-400 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detecting Your Location (GPS)...' : 'Auto-Detect Current Location'}</span>
          </button>

          {detectionNotice && (
            <div className="p-2.5 bg-blue-50 border border-blue-100 text-blue-900 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="flex-1">{detectionNotice}</span>
            </div>
          )}

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Harare, Bulawayo, Avondale, Borrowdale, custom place..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Major City Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setActiveCityTab('all')}
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                activeCityTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Cities
            </button>
            {['Harare', 'Bulawayo', 'Masvingo', 'Gweru', 'Mutare', 'Chitungwiza', 'Victoria Falls'].map(
              (city) => (
                <button
                  key={city}
                  onClick={() => setActiveCityTab(city)}
                  className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                    activeCityTab.toLowerCase() === city.toLowerCase()
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {city}
                </button>
              )
            )}
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Option: All Locations */}
          {allowAll && !searchQuery && activeCityTab === 'all' && (
            <div>
              <button
                type="button"
                onClick={() => {
                  onSelectLocation('All Locations');
                  onClose();
                }}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  selectedLocation === 'All Locations' || selectedLocation === 'All Hoods'
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold shadow-sm'
                    : 'bg-white border-gray-200 hover:border-emerald-200 hover:bg-gray-50 text-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold">All Locations / Nationwide</span>
                    <span className="block text-[11px] text-gray-500">Show services across all neighborhoods</span>
                  </div>
                </div>
                {(selectedLocation === 'All Locations' || selectedLocation === 'All Hoods') && (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
              </button>
            </div>
          )}

          {/* User Custom Places */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>My Custom Places</span>
                <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-600">
                  {customPlaces.length}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'Cancel' : 'Add Custom Place'}</span>
              </button>
            </div>

            {/* Inline Add Custom Place Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleSaveNewPlace}
                  className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 space-y-2.5 overflow-hidden"
                >
                  <div className="text-xs font-bold text-emerald-900">Add New Place / Neighborhood</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Place name (e.g. Westlea Ext, Damafalls)"
                      value={newPlaceName}
                      onChange={(e) => setNewPlaceName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <select
                      value={newPlaceCity}
                      onChange={(e) => setNewPlaceCity(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">City (Optional)</option>
                      {majorCities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="Other">Other / Rural</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 bg-white text-gray-700 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newPlaceName.trim()}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50"
                    >
                      Save & Select
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Custom places items */}
            {filteredData.custom.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredData.custom.map((place) => {
                  const isSelected = selectedLocation.toLowerCase() === place.name.toLowerCase();
                  return (
                    <div
                      key={place.id}
                      onClick={() => {
                        onSelectLocation(place.name);
                        onClose();
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold shadow-sm'
                          : 'bg-white border-gray-200 hover:border-emerald-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <span className="block text-xs font-bold truncate">{place.name}</span>
                        {place.city && (
                          <span className="block text-[10px] text-gray-500 truncate">{place.city}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleStartEdit(place, e)}
                          title="Edit Place"
                          className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(place, e)}
                          title="Delete Place"
                          className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : customPlaces.length === 0 && !showAddForm ? (
              <div className="p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                  No custom places saved yet. Click <span className="font-bold text-emerald-600">Add Custom Place</span> to add your exact area or street!
                </p>
              </div>
            ) : null}
          </div>

          {/* Edit Custom Place Modal/Form */}
          <AnimatePresence>
            {editingPlace && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-60 bg-black/40 flex items-center justify-center p-4"
              >
                <div className="bg-white rounded-2xl p-4 max-w-sm w-full space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900">Edit Custom Place</h3>
                    <button onClick={() => setEditingPlace(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleSaveEdit} className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Place Name</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Parent City</label>
                      <select
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="">None / Other</option>
                        {majorCities.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingPlace(null)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
                      >
                        Update
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Major Cities & Suburbs List */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider block">
              Zimbabwe Major Cities & Suburbs
            </span>

            {filteredData.cities.map((group) => {
              const isCitySelected = selectedLocation.toLowerCase() === group.city.toLowerCase();

              return (
                <div key={group.city} className="bg-gray-50/70 p-3 rounded-2xl border border-gray-200 space-y-2.5">
                  {/* City Header - Can be clicked to select the entire city! */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectLocation(group.city);
                        onClose();
                      }}
                      className={`text-left flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all ${
                        isCitySelected
                          ? 'bg-emerald-600 text-white font-bold shadow-sm'
                          : 'hover:bg-white text-gray-900 font-bold'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span className="text-xs">{group.city} (All Suburbs)</span>
                      {isCitySelected && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {group.suburbs.length} suburbs
                    </span>
                  </div>

                  {/* Suburbs Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {group.suburbs.map((suburb) => {
                      const isSubSelected =
                        selectedLocation.toLowerCase() === suburb.toLowerCase() ||
                        selectedLocation.toLowerCase() === `${suburb}, ${group.city}`.toLowerCase();

                      return (
                        <button
                          key={suburb}
                          type="button"
                          onClick={() => {
                            onSelectLocation(suburb);
                            onClose();
                          }}
                          className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium truncate transition-all ${
                            isSubSelected
                              ? 'bg-emerald-600 text-white font-bold shadow-sm'
                              : 'bg-white border border-gray-150 hover:border-emerald-300 hover:bg-emerald-50/40 text-gray-700'
                          }`}
                        >
                          {suburb}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {filteredData.cities.length === 0 && filteredData.custom.length === 0 && (
              <div className="py-8 text-center space-y-2">
                <p className="text-sm font-semibold text-gray-600">No matching locations found for "{searchQuery}"</p>
                <p className="text-xs text-gray-400">
                  You can click <span className="font-bold text-emerald-600">Add Custom Place</span> above to add it!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>
            Current: <strong className="text-gray-900">{selectedLocation}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
