import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  Package,
  Settings,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ProductService } from '../types';
import { useAuth } from '../hooks/useAuth';

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [services, setServices] = useState<ProductService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'products_services'),
      where('providerId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const serviceList: ProductService[] = [];
      snapshot.forEach((doc) => {
        serviceList.push({ id: doc.id, ...doc.data() } as ProductService);
      });
      setServices(serviceList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching services:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteService = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteDoc(doc(db, 'products_services', id));
      } catch (error) {
        console.error("Error deleting service:", error);
      }
    }
  };

  const stats = [
    { label: 'Active Services', value: services.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Bookings', value: 0, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Revenue', value: '$0', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Rating', value: profile?.rating || 'N/A', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-100 overflow-hidden border-4 border-white">
            {profile?.businessLogoUrl ? (
              <img src={profile.businessLogoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Package className="text-white w-10 h-10" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{profile?.businessName || 'Your Business'}</h1>
            <p className="text-gray-600 flex items-center gap-2">
              {profile?.industry} • {profile?.businessType}
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-green-600 font-bold text-xs uppercase tracking-wider">Active Provider</span>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/company-profile')}
            className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm group"
            title="Company Profile"
          >
            <Settings className="w-6 h-6 text-gray-600 group-hover:rotate-90 transition-transform duration-500" />
          </button>
          <button 
            onClick={() => navigate('/tasks')}
            className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm group flex items-center gap-2 px-6"
            title="Browse Tasks"
          >
            <Search className="w-5 h-5 text-gray-600" />
            <span className="font-bold text-gray-700">Browse Tasks</span>
          </button>
          <button 
            onClick={() => navigate(profile?.isProviderSetupComplete ? '/create-service' : '/provider-setup')}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Create Service
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-gray-500 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Services Section */}
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Your Products & Services</h2>
          <div className="flex gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search services..." 
                className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <motion.div
                key={service.id}
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group"
              >
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  <img 
                    src={service.imageUrl || `https://picsum.photos/seed/${service.id}/400/300`} 
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-gray-600 hover:text-blue-600 transition-colors shadow-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteService(service.id)}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-gray-600 hover:text-red-600 transition-colors shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
                      {service.category || 'General'}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold shadow-lg ${service.type === 'product' ? 'bg-purple-600 text-white' : 'bg-green-600 text-white'}`}>
                      {service.type === 'product' ? 'Product' : 'Service'}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{service.name}</h3>
                    <span className="text-blue-600 font-black text-lg">${service.price}</span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-6">{service.description}</p>
                  <button className="w-full py-3 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    View Public Page
                  </button>
                </div>
              </motion.div>
            ))}

            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(profile?.isProviderSetupComplete ? '/create-service' : '/provider-setup')}
              className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-12 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900">Create new service</h3>
              <p className="text-gray-500 text-sm">Expand your business offerings</p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
