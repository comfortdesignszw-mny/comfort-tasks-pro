import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Package, 
  Star, 
  MapPin, 
  ChevronRight, 
  Phone, 
  MessageSquare, 
  User, 
  Clock, 
  CheckCircle2,
  Zap,
  Building2,
  SlidersHorizontal,
  X,
  Navigation,
  Compass,
  Edit,
  Trash2,
  Share2
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { ProductService } from '../types';
import { CATEGORIES } from '../constants/categories';
import { POPULAR_HOODS } from '../constants/neighborhoods';
import { WhatsAppOrderModal } from '../components/WhatsAppOrderModal';
import { RatingModal } from '../components/RatingModal';
import { EditServiceModal } from '../components/EditServiceModal';
import { DeleteServiceModal } from '../components/DeleteServiceModal';
import { ShareServiceModal } from '../components/ShareServiceModal';
import { getUserCurrentPosition, findClosestHood, calculateDistanceKm, HOOD_COORDINATES } from '../lib/geo';

export default function BrowseServices() {
  const { user } = useAuth();

  const [services, setServices] = useState<ProductService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedHood, setSelectedHood] = useState<string>('All Hoods');
  const [filterType, setFilterType] = useState<'all' | 'service' | 'product'>('all');
  const [sameHoodOnly, setSameHoodOnly] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(false);

  // Geolocation
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  // Modals state
  const [activeServiceForOrder, setActiveServiceForOrder] = useState<ProductService | null>(null);
  const [activeServiceForRating, setActiveServiceForRating] = useState<ProductService | null>(null);
  const [activeServiceForEdit, setActiveServiceForEdit] = useState<ProductService | null>(null);
  const [activeServiceForDelete, setActiveServiceForDelete] = useState<ProductService | null>(null);
  const [activeServiceForShare, setActiveServiceForShare] = useState<ProductService | null>(null);

  // Read saved hood & coordinates from local storage if available
  useEffect(() => {
    try {
      const cached = localStorage.getItem('comfort_handyman_customer');
      if (cached) {
        const data = JSON.parse(cached);
        if (data.hood && data.hood.trim()) {
          setSelectedHood(data.hood);
        }
        if (data.lat && data.lng) {
          setUserCoords({ latitude: data.lat, longitude: data.lng });
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    const servicesQuery = query(collection(db, 'products_services'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      servicesQuery,
      (snapshot) => {
        const serviceList: ProductService[] = [];
        snapshot.forEach((doc) => {
          serviceList.push({ id: doc.id, ...doc.data() } as ProductService);
        });
        setServices(serviceList);
        setLoading(false);
      },
      (error) => {
        console.warn("Snapshot error or offline mode", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDetectLocation = async () => {
    setLocating(true);
    setGeoNotice(null);
    try {
      const coords = await getUserCurrentPosition();
      setUserCoords(coords);
      setSortByDistance(true);
      const match = findClosestHood(coords);
      if (match) {
        setSelectedHood(match.hood);
        setGeoNotice(`Found closest neighborhood: ${match.hood} (${match.distanceKm} km away)`);
        
        const cached = localStorage.getItem('comfort_handyman_customer');
        const data = cached ? JSON.parse(cached) : {};
        data.hood = match.hood;
        data.lat = coords.latitude;
        data.lng = coords.longitude;
        localStorage.setItem('comfort_handyman_customer', JSON.stringify(data));
      } else {
        setGeoNotice('Device GPS enabled. Sorting nearest services first.');
      }
    } catch (err: any) {
      setGeoNotice('Could not retrieve GPS coordinates. Please select your neighborhood manually.');
    } finally {
      setLocating(false);
    }
  };

  const handleHoodChange = (hood: string) => {
    setSelectedHood(hood);
    try {
      const cached = localStorage.getItem('comfort_handyman_customer');
      const data = cached ? JSON.parse(cached) : {};
      if (hood !== 'All Hoods') {
        data.hood = hood;
        localStorage.setItem('comfort_handyman_customer', JSON.stringify(data));
      }
    } catch (e) {
      // ignore
    }
  };

  const getServiceDistance = (service: ProductService): number | null => {
    if (!userCoords) return null;
    const hood = service.providerHood || service.providerLocation;
    if (hood && HOOD_COORDINATES[hood]) {
      const hoodCoords = HOOD_COORDINATES[hood];
      return calculateDistanceKm(
        userCoords.latitude,
        userCoords.longitude,
        hoodCoords.latitude,
        hoodCoords.longitude
      );
    }
    return null;
  };

  const isLocalToUser = (service: ProductService): boolean => {
    if (!selectedHood || selectedHood === 'All Hoods') return false;
    const hoodLower = selectedHood.toLowerCase();
    const serviceHood = (service.providerHood || service.providerLocation || '').toLowerCase();
    return serviceHood.includes(hoodLower) || hoodLower.includes(serviceHood);
  };

  // Filter and sort services
  const filteredServices = services
    .filter((service) => {
      // Text Search
      if (searchQuery) {
        const queryLower = searchQuery.toLowerCase();
        const matchesName = service.name.toLowerCase().includes(queryLower);
        const matchesDesc = service.description.toLowerCase().includes(queryLower);
        const matchesCat = service.category?.toLowerCase().includes(queryLower);
        const matchesProvider = service.providerName?.toLowerCase().includes(queryLower);
        const matchesHood = (service.providerHood || service.providerLocation || '').toLowerCase().includes(queryLower);
        if (!matchesName && !matchesDesc && !matchesCat && !matchesProvider && !matchesHood) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'All') {
        const catLower = selectedCategory.toLowerCase();
        const serviceCatLower = (service.category || '').toLowerCase();
        if (catLower === 'other') {
          const isStandard = CATEGORIES.some(
            (c) => c.name !== 'Other' && c.name.toLowerCase() === serviceCatLower
          );
          if (isStandard && !serviceCatLower.startsWith('other')) {
            return false;
          }
        } else if (!serviceCatLower.includes(catLower)) {
          return false;
        }
      }

      // Type filter (service vs product)
      if (filterType !== 'all') {
        if (service.type !== filterType) {
          return false;
        }
      }

      // Neighborhood filter
      if (sameHoodOnly) {
        return isLocalToUser(service);
      }

      return true;
    })
    .sort((a, b) => {
      // If user sorted by distance and coordinates exist
      if (sortByDistance || userCoords) {
        const distA = getServiceDistance(a);
        const distB = getServiceDistance(b);
        if (distA !== null && distB !== null) return distA - distB;
        if (distA !== null) return -1;
        if (distB !== null) return 1;
      }

      // Proximity boost
      const aLocal = isLocalToUser(a) ? 1 : 0;
      const bLocal = isLocalToUser(b) ? 1 : 0;
      if (aLocal !== bLocal) return bLocal - aLocal;

      return (b.createdAt || 0) - (a.createdAt || 0);
    });

  const localCount = services.filter((s) => isLocalToUser(s)).length;

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto space-y-8">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Verified Trades & Services
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mt-1">
            Handyman Directory
          </h1>
          <p className="text-gray-600 text-sm mt-1 max-w-2xl">
            Browse published local handymen, technicians, and runners. Order in 1 tap on WhatsApp or rate completed jobs.
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 bg-white rounded-2xl border border-gray-200 text-center">
            <span className="block text-lg font-black text-gray-900">{services.length}</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase">Available</span>
          </div>
          <div className="px-4 py-2.5 bg-white rounded-2xl border border-gray-200 text-center">
            <span className="block text-lg font-black text-blue-600">{CATEGORIES.length}</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase">Trades</span>
          </div>
        </div>
      </div>

      {/* Search & Location Bar */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search plumber, tiler, electrician, salon, runner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          {/* Neighborhood Selector */}
          <div className="md:col-span-3 flex items-center gap-2 bg-white px-3.5 py-2.5 rounded-2xl border border-gray-200 shadow-sm">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="flex-1">
              <span className="block text-[9px] uppercase font-bold text-gray-400">Neighborhood</span>
              <select
                value={selectedHood}
                onChange={(e) => handleHoodChange(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-gray-900 outline-none cursor-pointer"
              >
                {POPULAR_HOODS.map((hood) => (
                  <option key={hood} value={hood}>
                    {hood}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* GPS Button */}
          <div className="md:col-span-3 flex gap-2">
            <button
              onClick={handleDetectLocation}
              disabled={locating}
              className="flex-1 py-3 px-3 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
              <span>{locating ? 'Locating...' : 'Use My GPS'}</span>
            </button>
          </div>
        </div>

        {geoNotice && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-medium flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{geoNotice}</span>
          </div>
        )}

        {/* Filter Chips & Type Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Service vs Product Switch */}
          <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setFilterType('service')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'service' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Services Only
            </button>
            <button
              onClick={() => setFilterType('product')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'product' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Materials / Products
            </button>
          </div>

          {/* Local Only checkbox */}
          {selectedHood !== 'All Hoods' && (
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-gray-200">
              <input
                type="checkbox"
                checked={sameHoodOnly}
                onChange={(e) => setSameHoodOnly(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span>Show {selectedHood} only ({localCount})</span>
            </label>
          )}
        </div>

        {/* Category horizontal scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedCategory === 'All'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedCategory.toLowerCase() === cat.name.toLowerCase()
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 h-80 animate-pulse" />
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 space-y-4">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto text-gray-400">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No services match your filters</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {sameHoodOnly 
              ? `No providers currently registered in "${selectedHood}". Select "All Hoods" or another neighborhood.`
              : 'Try clearing your search query or choosing another trade category.'}
          </p>
          <div className="flex gap-2.5 justify-center pt-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSameHoodOnly(false);
                setSelectedHood('All Hoods');
                setFilterType('all');
              }}
              className="px-4 py-2 rounded-xl bg-gray-900 text-white font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const isOwner = !!(user && user.uid === service.providerId);
            const distance = getServiceDistance(service);
            const isLocal = isLocalToUser(service);

            return (
              <div
                key={service.id}
                className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                  isOwner ? 'border-blue-400 ring-2 ring-blue-50' : 'border-gray-200'
                }`}
              >
                <div>
                  {/* Image & Price Header */}
                  <div className="h-44 bg-gray-100 relative overflow-hidden">
                    <img
                      src={service.imageUrl || `https://picsum.photos/seed/${service.id}/400/300`}
                      alt={service.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    <div className="absolute top-3 left-3 flex gap-1.5 items-center">
                      <span className="bg-gray-950/90 text-white px-2.5 py-1 rounded-lg text-xs font-black">
                        ${service.price}
                      </span>
                      <span className="bg-white/95 text-gray-800 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-gray-200">
                        {service.category || 'General'}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                      {isOwner && (
                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold shadow">
                          Your Listing
                        </span>
                      )}
                      {distance !== null && (
                        <span className="bg-emerald-700 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold shadow flex items-center gap-1">
                          <Navigation className="w-2.5 h-2.5" />
                          {distance} km
                        </span>
                      )}
                      {!distance && isLocal && (
                        <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold shadow">
                          Same Hood
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Service Info */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-950 line-clamp-1">
                        {service.name}
                      </h3>
                      <p className="text-gray-500 text-xs line-clamp-2 mt-1">
                        {service.description}
                      </p>
                    </div>

                    {/* Rating Stats & Quick Rate button */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-gray-900">
                          {service.ratingAvg ? service.ratingAvg.toFixed(1) : 'New'}
                        </span>
                        <span className="text-gray-400 text-[11px]">
                          ({service.ratingCount || 0} {service.ratingCount === 1 ? 'rating' : 'ratings'})
                        </span>
                      </div>

                      {!isOwner ? (
                        <button
                          type="button"
                          onClick={() => setActiveServiceForRating(service)}
                          className="text-blue-600 hover:text-blue-800 font-bold text-xs"
                        >
                          Rate
                        </button>
                      ) : (
                        <span className="text-[11px] font-medium text-gray-400">Owner</span>
                      )}
                    </div>

                    {/* Provider Info */}
                    <div className="flex items-center justify-between text-xs pt-1 text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium text-gray-800 line-clamp-1">
                          {service.providerName || 'Local Handyman'}
                        </span>
                      </div>
                      {(service.providerHood || service.providerLocation) && (
                        <div className="flex items-center gap-1 text-gray-600 text-[11px]">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span className="line-clamp-1">{service.providerHood || service.providerLocation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* REBAC Controls: Owner vs Customer */}
                <div className="p-4 pt-0 space-y-2">
                  {isOwner ? (
                    <div className="bg-gray-50 p-2 rounded-xl border border-gray-200 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveServiceForEdit(service)}
                        className="flex-1 py-1.5 px-2 bg-white hover:bg-gray-100 text-gray-800 rounded-lg text-xs font-bold border border-gray-200 flex items-center justify-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5 text-blue-600" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveServiceForDelete(service)}
                        className="py-1.5 px-3 bg-white hover:bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-gray-200 flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveServiceForShare(service)}
                        className="py-1.5 px-3 bg-white hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold border border-gray-200 flex items-center justify-center gap-1"
                      >
                        <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveServiceForOrder(service)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>1-Tap WhatsApp Order</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveServiceForShare(service)}
                        title="Share service"
                        className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <WhatsAppOrderModal
        service={activeServiceForOrder}
        isOpen={!!activeServiceForOrder}
        onClose={() => setActiveServiceForOrder(null)}
        defaultHood={selectedHood !== 'All Hoods' ? selectedHood : ''}
      />

      <RatingModal
        service={activeServiceForRating}
        isOpen={!!activeServiceForRating}
        onClose={() => setActiveServiceForRating(null)}
        onRatingSubmitted={() => {}}
      />

      <EditServiceModal
        service={activeServiceForEdit}
        isOpen={!!activeServiceForEdit}
        onClose={() => setActiveServiceForEdit(null)}
        onSaved={() => {}}
      />

      <DeleteServiceModal
        service={activeServiceForDelete}
        isOpen={!!activeServiceForDelete}
        onClose={() => setActiveServiceForDelete(null)}
        onDeleted={() => {}}
      />

      <ShareServiceModal
        service={activeServiceForShare}
        isOpen={!!activeServiceForShare}
        onClose={() => setActiveServiceForShare(null)}
      />
    </div>
  );
}
