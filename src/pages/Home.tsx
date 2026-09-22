import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Zap, 
  MessageSquare, 
  ChevronRight, 
  Phone, 
  User, 
  CheckCircle2,
  Building,
  Wrench,
  Droplets,
  Grid,
  Trees,
  Tv,
  Scissors,
  SprayCan,
  ShoppingBag,
  Hammer,
  Paintbrush,
  Star,
  Edit,
  Trash2,
  Share2,
  Navigation,
  Compass,
  Check,
  Code,
  Briefcase,
  Palette,
  MoreHorizontal
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
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

const getCategoryIcon = (id: string) => {
  switch (id) {
    case 'building': return <Building className="w-4 h-4" />;
    case 'plumbing': return <Droplets className="w-4 h-4" />;
    case 'tiling': return <Grid className="w-4 h-4" />;
    case 'landscaping': return <Trees className="w-4 h-4" />;
    case 'electronics-repair': return <Tv className="w-4 h-4" />;
    case 'barber': return <Scissors className="w-4 h-4" />;
    case 'salon': return <Scissors className="w-4 h-4" />;
    case 'general-cleaners': return <SprayCan className="w-4 h-4" />;
    case 'runners': return <ShoppingBag className="w-4 h-4" />;
    case 'handyman': return <Hammer className="w-4 h-4" />;
    case 'electrical': return <Zap className="w-4 h-4" />;
    case 'painting': return <Paintbrush className="w-4 h-4" />;
    case 'software-and-applications': return <Code className="w-4 h-4" />;
    case 'consultation': return <Briefcase className="w-4 h-4" />;
    case 'designs': return <Palette className="w-4 h-4" />;
    case 'other': return <MoreHorizontal className="w-4 h-4" />;
    default: return <Wrench className="w-4 h-4" />;
  }
};

export default function Home() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [services, setServices] = useState<ProductService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHood, setSelectedHood] = useState<string>('All Hoods');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Geolocation states
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  // Modals state
  const [activeServiceForOrder, setActiveServiceForOrder] = useState<ProductService | null>(null);
  const [activeServiceForRating, setActiveServiceForRating] = useState<ProductService | null>(null);
  const [activeServiceForEdit, setActiveServiceForEdit] = useState<ProductService | null>(null);
  const [activeServiceForDelete, setActiveServiceForDelete] = useState<ProductService | null>(null);
  const [activeServiceForShare, setActiveServiceForShare] = useState<ProductService | null>(null);

  // Read cached customer hood
  useEffect(() => {
    try {
      const cached = localStorage.getItem('comfort_handyman_customer');
      if (cached) {
        const data = JSON.parse(cached);
        if (data.hood) setSelectedHood(data.hood);
        if (data.lat && data.lng) {
          setUserCoords({ latitude: data.lat, longitude: data.lng });
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Real-time published services from all providers
  useEffect(() => {
    const q = query(collection(db, 'products_services'), orderBy('createdAt', 'desc'), limit(15));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ProductService[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as ProductService);
      });
      setServices(list);
      setLoading(false);
    }, (err) => {
      console.warn("Could not load services on home", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Geolocation trigger
  const handleDetectLocation = async () => {
    setLocating(true);
    setGeoNotice(null);
    try {
      const coords = await getUserCurrentPosition();
      setUserCoords(coords);
      const match = findClosestHood(coords);
      if (match) {
        setSelectedHood(match.hood);
        setGeoNotice(`Located near ${match.hood} (~${match.distanceKm} km away)`);
        
        // Save to local cache
        const cached = localStorage.getItem('comfort_handyman_customer');
        const data = cached ? JSON.parse(cached) : {};
        data.hood = match.hood;
        data.lat = coords.latitude;
        data.lng = coords.longitude;
        localStorage.setItem('comfort_handyman_customer', JSON.stringify(data));
      } else {
        setGeoNotice('Location detected. Prioritizing nearest services.');
      }
    } catch (err: any) {
      setGeoNotice('Could not get GPS location. Please select your neighborhood manually.');
    } finally {
      setLocating(false);
    }
  };

  const handleHoodChange = (hood: string) => {
    setSelectedHood(hood);
    try {
      const cached = localStorage.getItem('comfort_handyman_customer');
      const data = cached ? JSON.parse(cached) : {};
      data.hood = hood;
      localStorage.setItem('comfort_handyman_customer', JSON.stringify(data));
    } catch (e) {
      // ignore
    }
  };

  // Distance helper
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

  const isLocal = (service: ProductService): boolean => {
    if (!selectedHood || selectedHood === 'All Hoods') return false;
    const hoodLower = selectedHood.toLowerCase();
    const serviceHood = (service.providerHood || service.providerLocation || '').toLowerCase();
    return serviceHood.includes(hoodLower) || hoodLower.includes(serviceHood);
  };

  const filteredServices = services
    .filter(s => {
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.category && s.category.toLowerCase().includes(q)) ||
        (s.providerName && s.providerName.toLowerCase().includes(q)) ||
        (s.providerHood && s.providerHood.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      // Distance sort if coordinates exist
      const distA = getServiceDistance(a);
      const distB = getServiceDistance(b);
      if (distA !== null && distB !== null) return distA - distB;

      const aLoc = isLocal(a) ? 1 : 0;
      const bLoc = isLocal(b) ? 1 : 0;
      if (aLoc !== bLoc) return bLoc - aLoc;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto space-y-16">
      {/* Header & Metrics */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100 text-gray-800 text-xs font-bold border border-gray-200">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span>Neighborhood Handyman Network • Direct WhatsApp Orders</span>
        </div>

        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-gray-950 leading-tight"
        >
          Comfort Handyman Tasks
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
        >
          Direct local matching for Building, Plumbing, Tiling, Landscaping, Electronics, Barber, Salon, Cleaners, and Runners. Instant 1-tap WhatsApp booking with local ratings.
        </motion.p>

        {/* Action / Search Bar with Geolocation */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-3 rounded-2xl border border-gray-200 shadow-md max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-2"
        >
          {/* Hood Select */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl w-full md:w-auto shrink-0 border border-gray-200">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-left">
              <span className="block text-[9px] uppercase font-bold text-gray-400">Neighborhood</span>
              <select
                value={selectedHood}
                onChange={(e) => handleHoodChange(e.target.value)}
                className="bg-transparent font-bold text-xs text-gray-900 outline-none cursor-pointer pr-1"
              >
                {POPULAR_HOODS.map(hood => (
                  <option key={hood} value={hood}>{hood}</option>
                ))}
              </select>
            </div>
          </div>

          {/* GPS Locate Me Button */}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={locating}
            title="Detect nearby handymen via device GPS"
            className="w-full md:w-auto px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold shrink-0 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Navigation className={`w-3.5 h-3.5 text-blue-600 ${locating ? 'animate-spin' : ''}`} />
            <span>{locating ? 'Locating...' : 'Near Me (GPS)'}</span>
          </button>

          {/* Search input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search plumber, electrician, runner, cleaner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl outline-none text-xs font-medium text-gray-900 placeholder-gray-400 bg-transparent"
            />
          </div>

          <button
            onClick={() => navigate('/services')}
            className="w-full md:w-auto bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all shrink-0 flex items-center justify-center gap-1.5"
          >
            <span>Explore All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {geoNotice && (
          <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium rounded-xl inline-flex items-center gap-2 max-w-xl mx-auto">
            <Compass className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{geoNotice}</span>
          </div>
        )}

        {/* Real Numbers & Facts Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4 text-left">
          <div className="p-4 bg-white rounded-2xl border border-gray-200">
            <div className="text-2xl font-black text-gray-900">{services.length}+</div>
            <div className="text-xs font-bold text-gray-500 uppercase mt-0.5">Live Listings</div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-gray-200">
            <div className="text-2xl font-black text-blue-600">{CATEGORIES.length}</div>
            <div className="text-xs font-bold text-gray-500 uppercase mt-0.5">Trade Categories</div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-gray-200">
            <div className="text-2xl font-black text-emerald-600">1-Tap</div>
            <div className="text-xs font-bold text-gray-500 uppercase mt-0.5">WhatsApp Orders</div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-gray-200">
            <div className="text-2xl font-black text-gray-900">0% Fee</div>
            <div className="text-xs font-bold text-gray-500 uppercase mt-0.5">Guest Friendly</div>
          </div>
        </div>
      </section>

      {/* Trade Categories Grid */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900">All Trade Categories</h2>
            <p className="text-gray-500 text-xs">Browse specialized trades and local professionals.</p>
          </div>
          <Link to="/services" className="text-blue-600 font-bold text-xs hover:underline flex items-center gap-1">
            View directory <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/services`)}
              className="p-3.5 bg-white rounded-2xl border border-gray-200 hover:border-gray-900 transition-all cursor-pointer text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center mb-2 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                {getCategoryIcon(cat.id)}
              </div>
              <h3 className="font-bold text-gray-900 text-xs">{cat.name}</h3>
              <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{cat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live Provider Offerings & REBAC Services */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Active Directory
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">
              Published Services & Handymen
            </h2>
            <p className="text-gray-500 text-xs mt-1">
              Persisted in database. Owners can edit, delete, or share their listings. Anyone can rate and order.
            </p>
          </div>

          {selectedHood !== 'All Hoods' && (
            <div className="flex items-center gap-1.5 bg-gray-100 text-gray-800 px-3 py-1 rounded-xl border border-gray-200 text-xs font-bold shrink-0">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Matching: {selectedHood}</span>
            </div>
          )}
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-white rounded-2xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-3">
            <Wrench className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">No services found for this criteria</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Are you a service provider? Log in to create your listing. It will be published here instantly.
            </p>
            <button
              onClick={() => navigate('/join')}
              className="px-5 py-2.5 bg-gray-900 text-white font-bold text-xs rounded-xl"
            >
              Join as Service Provider
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => {
              const isOwner = !!(user && user.uid === service.providerId);
              const distance = getServiceDistance(service);
              const localMatch = isLocal(service);

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
                        src={service.imageUrl || `https://picsum.photos/seed/${service.id}/500/350`}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5 items-center">
                        <span className="bg-gray-950/90 text-white px-2.5 py-1 rounded-lg text-xs font-black">
                          ${service.price}
                        </span>
                        <span className="bg-white/90 text-gray-800 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-gray-200">
                          {service.category || 'General'}
                        </span>
                      </div>

                      {/* Distance / Hood Badge */}
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
                        {!distance && localMatch && (
                          <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold shadow">
                            Same Hood
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-bold text-gray-950 text-base line-clamp-1">{service.name}</h3>
                        <p className="text-gray-500 text-xs line-clamp-2 mt-1">{service.description}</p>
                      </div>

                      {/* Ratings Strip & Reviews */}
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

                        {/* If not owner, show quick Rate button */}
                        {!isOwner ? (
                          <button
                            type="button"
                            onClick={() => setActiveServiceForRating(service)}
                            className="text-blue-600 hover:text-blue-800 font-bold text-xs flex items-center gap-1"
                          >
                            <span>Rate</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-medium text-gray-400">Owner</span>
                        )}
                      </div>

                      {/* Provider name & Neighborhood */}
                      <div className="flex items-center justify-between text-xs pt-1 text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium text-gray-800 line-clamp-1">
                            {service.providerName || 'Local Provider'}
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

                  {/* Actions Bar - Strict REBAC: Edit & Delete only for owner */}
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
      </section>

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
