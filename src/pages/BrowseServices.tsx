import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Package, Star, MapPin, ChevronRight, Phone, MessageSquare, User, Clock, CheckCircle2 } from 'lucide-react';
import { collection, query, onSnapshot, orderBy, doc, getDoc, addDoc, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ProductService, UserProfile, ServiceRequest } from '../types';

export default function BrowseServices() {
  const [services, setServices] = useState<(ProductService & { provider?: UserProfile })[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;

    const servicesQuery = query(collection(db, 'products_services'), orderBy('createdAt', 'desc'));

    const unsubscribeServices = onSnapshot(servicesQuery, async (snapshot) => {
      const serviceList: any[] = [];
      snapshot.forEach((doc) => {
        serviceList.push({ id: doc.id, ...doc.data() });
      });
      setServices(serviceList);
      setLoading(false);
    });

    // Fetch user's service requests
    const requestsQuery = query(
      collection(db, 'service_requests'),
      where('clientId', '==', auth.currentUser.uid)
    );

    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      const requestList: ServiceRequest[] = [];
      snapshot.forEach((doc) => {
        requestList.push({ id: doc.id, ...doc.data() } as ServiceRequest);
      });
      setRequests(requestList);
    });

    return () => {
      unsubscribeServices();
      unsubscribeRequests();
    };
  }, []);

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRequestService = async (service: ProductService) => {
    if (!auth.currentUser) {
      alert("Please sign in to request services.");
      return;
    }

    const existingRequest = requests.find(r => 
      r.providerId === service.providerId && 
      (Date.now() - r.timestamp) < 24 * 60 * 60 * 1000
    );

    if (existingRequest) {
      alert(`You already requested a service from ${service.providerName} recently. Contact details:\nPhone: ${service.providerPhone || 'Not provided'}\nEmail: ${service.providerEmail || 'Not provided'}`);
      return;
    }
    
    const confirmRequest = window.confirm(`Request "${service.name}"? This will reveal ${service.providerName}'s contact details and mark them as requested for 24 hours.`);
    if (confirmRequest) {
      try {
        await addDoc(collection(db, 'service_requests'), {
          clientId: auth.currentUser.uid,
          providerId: service.providerId,
          serviceId: service.id,
          timestamp: Date.now()
        });
        alert(`Request Sent! Contact details for ${service.providerName}:\nPhone: ${service.providerPhone || 'Not provided'}\nEmail: ${service.providerEmail || 'Not provided'}`);
      } catch (error) {
        console.error("Error creating service request:", error);
        alert("Failed to send request. Please try again.");
      }
    }
  };

  const isRequested = (providerId: string) => {
    return requests.some(r => 
      r.providerId === providerId && 
      (Date.now() - r.timestamp) < 24 * 60 * 60 * 1000
    );
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Professional Services</h1>
        <p className="text-xl text-gray-600">Browse products and services offered by our trusted providers.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Price Range</label>
                <input type="range" className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-5 h-5 text-gray-200 hover:text-yellow-400 cursor-pointer transition-colors" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search services (e.g. 'cleaning', 'consulting')..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 h-64 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredServices.map((service) => (
                <motion.div
                  key={service.id}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group cursor-pointer"
                >
                  <div className="h-48 bg-gray-100 relative">
                    <img 
                      src={service.imageUrl || `https://picsum.photos/seed/${service.id}/400/300`} 
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-white/90 backdrop-blur-sm text-blue-600 px-3 py-1 rounded-lg text-sm font-black shadow-lg">
                        ${service.price}
                      </span>
                      <span className={`backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg ${service.type === 'product' ? 'bg-purple-600/90' : 'bg-green-600/90'}`}>
                        {service.type === 'product' ? 'Product' : 'Service'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{service.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-3 h-3 text-gray-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-500">{service.providerName}</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-6">{service.description}</p>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRequestService(service);
                      }}
                      className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg mb-4 ${
                        isRequested(service.providerId)
                          ? 'bg-green-50 text-green-600 border border-green-100 shadow-green-50'
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                      }`}
                    >
                      {isRequested(service.providerId) ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Requested
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4" />
                          Request Service
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <Package className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-gray-500">View Details</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
