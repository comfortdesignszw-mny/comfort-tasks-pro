import React, { useState } from 'react';
import { MapPin, Navigation, ChevronDown, Plus, Sparkles } from 'lucide-react';
import { LocationPickerModal } from './LocationPickerModal';
import { useLocations } from '../hooks/useLocations';

interface LocationSelectorProps {
  value: string;
  onChange: (location: string) => void;
  allowAll?: boolean;
  compact?: boolean;
  className?: string;
  showAutoDetectBtn?: boolean;
}

export function LocationSelector({
  value,
  onChange,
  allowAll = true,
  compact = false,
  className = '',
  showAutoDetectBtn = true,
}: LocationSelectorProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { detectUserLocation, isLocating, detectionNotice } = useLocations();

  const handleQuickGps = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await detectUserLocation();
    if (result) {
      onChange(result.locationName);
    }
  };

  const displayLocation = value || (allowAll ? 'All Locations' : 'Harare');

  if (compact) {
    return (
      <>
        <div className={`flex items-center gap-1.5 ${className}`}>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all shadow-sm max-w-[200px]"
            title="Change Location / Neighborhood"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{displayLocation}</span>
            <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
          </button>

          {showAutoDetectBtn && (
            <button
              type="button"
              onClick={handleQuickGps}
              disabled={isLocating}
              title="Auto-detect location via GPS"
              className="p-1.5 bg-gray-100 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 rounded-xl border border-gray-200 transition-colors shrink-0 disabled:opacity-50"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          )}
        </div>

        <LocationPickerModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          selectedLocation={displayLocation}
          onSelectLocation={onChange}
          allowAll={allowAll}
        />
      </>
    );
  }

  return (
    <>
      <div className={`flex flex-col sm:flex-row items-stretch gap-2 ${className}`}>
        {/* Main Trigger Button */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex-1 flex items-center justify-between gap-3 px-3.5 py-2.5 bg-white border border-gray-200 hover:border-emerald-300 hover:bg-gray-50/50 rounded-2xl shadow-sm transition-all text-left group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[9px] uppercase font-bold text-gray-400">Location / City</span>
              <span className="block text-xs font-bold text-gray-900 truncate">
                {displayLocation}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 text-gray-400 group-hover:text-gray-600">
            <span className="text-[11px] font-medium text-emerald-600 hidden md:inline">Change</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </button>

        {/* GPS Button */}
        {showAutoDetectBtn && (
          <button
            type="button"
            onClick={handleQuickGps}
            disabled={isLocating}
            title="Auto-detect nearest city or neighborhood via device GPS"
            className="px-3.5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl text-xs font-bold shrink-0 flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] disabled:opacity-60"
          >
            <Navigation className={`w-3.5 h-3.5 text-emerald-400 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="whitespace-nowrap">{isLocating ? 'Detecting...' : 'Auto Detect (GPS)'}</span>
          </button>
        )}
      </div>

      {detectionNotice && (
        <p className="text-[11px] text-emerald-700 font-medium px-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>{detectionNotice}</span>
        </p>
      )}

      <LocationPickerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedLocation={displayLocation}
        onSelectLocation={onChange}
        allowAll={allowAll}
      />
    </>
  );
}
