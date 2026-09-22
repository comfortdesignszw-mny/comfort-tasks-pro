import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Upload, AlertCircle, Wrench, Package } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { ProductService } from '../types';
import { CATEGORIES } from '../constants/categories';
import { POPULAR_HOODS } from '../constants/neighborhoods';

interface EditServiceModalProps {
  service: ProductService | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const EditServiceModal: React.FC<EditServiceModalProps> = ({
  service,
  isOpen,
  onClose,
  onSaved,
}) => {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [category, setCategory] = useState(CATEGORIES[0]?.name || 'Handyman');
  const [customCategory, setCustomCategory] = useState('');
  const [type, setType] = useState<'service' | 'product'>('service');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [providerHood, setProviderHood] = useState(POPULAR_HOODS[1] || 'CBD / Central');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with service values
  useEffect(() => {
    if (service) {
      setName(service.name || '');
      setDescription(service.description || '');
      setPrice(service.price ?? '');

      const isKnownCategory = CATEGORIES.some(
        (c) => c.name.toLowerCase() === (service.category || '').toLowerCase()
      );

      if (service.category?.startsWith('Other:') || service.category === 'Other' || (!isKnownCategory && service.category)) {
        setCategory('Other');
        const customVal =
          service.customCategory ||
          (service.category?.startsWith('Other:')
            ? service.category.replace('Other:', '').trim()
            : !isKnownCategory
            ? service.category
            : '');
        setCustomCategory(customVal || '');
      } else {
        setCategory(service.category || CATEGORIES[0]?.name || 'Handyman');
        setCustomCategory('');
      }

      setType(service.type || 'service');
      setWhatsappNumber(service.providerWhatsApp || service.providerPhone || '');
      setProviderHood(service.providerHood || service.providerLocation || POPULAR_HOODS[1]);
      setImageUrl(service.imageUrl || '');
      setError(null);
    }
  }, [service, isOpen]);

  if (!isOpen || !service) return null;

  // REBAC Check: Only service owner can edit
  const isOwner = !!(user && user.uid === service.providerId);
  if (!isOwner) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="font-bold text-gray-900 text-lg">Access Denied</h3>
          <p className="text-xs text-gray-600">
            Relationship-Based Access Control (REBAC) prevents editing services that you do not own.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Handle device image upload (reads file as Base64/DataURL)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image file size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a service or product name.');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setError('Please enter a valid price.');
      return;
    }

    if (category === 'Other' && !customCategory.trim()) {
      setError('Please specify the product or service.');
      return;
    }

    setLoading(true);

    try {
      const effectiveCategory = category === 'Other' && customCategory.trim()
        ? `Other: ${customCategory.trim()}`
        : category;

      await updateDoc(doc(db, 'products_services', service.id), {
        name: name.trim(),
        description: description.trim(),
        price: numPrice,
        category: effectiveCategory,
        customCategory: category === 'Other' ? customCategory.trim() : '',
        type,
        providerWhatsApp: whatsappNumber.trim(),
        providerHood,
        providerLocation: providerHood,
        imageUrl: imageUrl.trim() || service.imageUrl || '',
        updatedAt: Date.now(),
      });

      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Failed to update service:', err);
      setError(err?.message || 'Failed to update service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative border border-gray-100 my-8"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-blue-600">
                Service Owner Management
              </span>
              <h3 className="text-xl font-black text-gray-900 mt-0.5">Edit Published Listing</h3>
              <p className="text-xs text-gray-500">
                Update your listing details. Changes update immediately across Home & Browse.
              </p>
            </div>

            {/* Type selector */}
            <div className="flex p-1 bg-gray-100 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setType('service')}
                className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  type === 'service' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                Service
              </button>
              <button
                type="button"
                onClick={() => setType('product')}
                className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  type === 'product' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                Product / Materials
              </button>
            </div>

            {/* Name & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-gray-700">Listing Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Master Pipe Leak Repairs"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">Price ($) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="25"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category & Hood */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700">Neighborhood *</label>
                <select
                  value={providerHood}
                  onChange={(e) => setProviderHood(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {POPULAR_HOODS.filter((h) => h !== 'All Hoods').map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Expands when Other is selected */}
              {category === 'Other' && (
                <div className="sm:col-span-2 space-y-1 pt-1">
                  <label className="block text-xs font-bold text-blue-900 flex items-center gap-1">
                    <span>Specify Product / Service</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="e.g. Solar Installation, Custom Woodwork, 3D Printing"
                    className="w-full px-3 py-2.5 bg-blue-50/40 border-2 border-blue-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    autoFocus
                  />
                  <span className="text-[10px] text-gray-500">
                    Type your specific trade or custom product/service offering
                  </span>
                </div>
              )}
            </div>

            {/* WhatsApp Number */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">WhatsApp Contact Number</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g. +263 77 123 4567"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700">Description *</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your service, materials used, turnaround time..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Image from device */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">Listing Photo</label>
              <div className="flex items-center gap-3">
                {imageUrl && (
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="flex-1 border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors bg-gray-50">
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">Choose image from device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 font-bold text-xs text-gray-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
