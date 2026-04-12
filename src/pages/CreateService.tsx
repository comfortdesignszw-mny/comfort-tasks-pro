import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  Plus, 
  Check,
  AlertCircle,
  DollarSign,
  Tag,
  AlignLeft,
  Type,
  Upload,
  Image as ImageIcon,
  Briefcase
} from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';

export default function CreateService() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    type: 'service' as 'service' | 'product',
    imageUrl: ''
  });

  // Redirect if not a provider or setup not complete
  if (profile && profile.role !== 'provider') {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const servicesRef = collection(db, 'products_services');
      await addDoc(servicesRef, {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        type: formData.type,
        imageUrl: formData.imageUrl || `https://picsum.photos/seed/${formData.name}/400/300`,
        providerId: user.uid,
        providerName: profile.businessName || profile.fullName,
        providerPhone: profile.phoneNumber || '',
        providerEmail: profile.email || '',
        createdAt: Date.now()
      });

      navigate('/provider-dashboard');
    } catch (err) {
      console.error("Error creating service:", err);
      setError('Failed to create service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setError("Image must be under 1MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-3xl mx-auto">
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <h1 className="text-4xl font-bold text-gray-900">Create New Service</h1>
        <p className="text-gray-600">Add a new offering to your business profile.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700">Offering Type</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'service'})}
                  className={`flex-1 py-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 ${formData.type === 'service' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-200'}`}
                >
                  <Briefcase className="w-5 h-5" />
                  Service
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'product'})}
                  className={`flex-1 py-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-2 ${formData.type === 'product' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-200'}`}
                >
                  <Package className="w-5 h-5" />
                  Product
                </button>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700">{formData.type === 'product' ? 'Product Name' : 'Service Name'}</label>
              <div className="relative">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Premium House Cleaning"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Price ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Category</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Select Category</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Repairs">Repairs</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700">Description</label>
              <div className="relative">
                <AlignLeft className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                <textarea
                  required
                  rows={4}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder={formData.type === 'product' ? "Describe the product features..." : "Describe what's included in this service..."}
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700">{formData.type === 'product' ? 'Product Image' : 'Service Image'}</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative group w-full h-64 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
              >
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon className="w-12 h-12 text-gray-300 mb-2" />
                    <span className="text-sm text-gray-400 font-medium">Click to upload {formData.type} image</span>
                    <span className="text-xs text-gray-400 mt-1">Recommended: 800x600px</span>
                  </>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                  <div className="bg-white p-3 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating {formData.type === 'product' ? 'Product' : 'Service'}...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Create {formData.type === 'product' ? 'Product' : 'Service'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
