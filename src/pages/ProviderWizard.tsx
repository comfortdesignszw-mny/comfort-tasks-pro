import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Upload, 
  Plus, 
  Trash2, 
  Briefcase, 
  Building2, 
  Phone, 
  Mail, 
  User,
  Image as ImageIcon,
  Package
} from 'lucide-react';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { ProductService } from '../types';

export default function ProviderWizard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    businessName: profile?.businessName || '',
    businessType: profile?.businessType || '',
    industry: profile?.industry || '',
    phoneNumber: profile?.phoneNumber || '',
    email: profile?.email || '',
    businessLogoUrl: profile?.businessLogoUrl || '',
    avatarUrl: profile?.avatarUrl || '',
  });

  // Effect to update form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        businessName: profile.businessName || '',
        businessType: profile.businessType || '',
        industry: profile.industry || '',
        phoneNumber: profile.phoneNumber || '',
        email: profile.email || '',
        businessLogoUrl: profile.businessLogoUrl || '',
        avatarUrl: profile.avatarUrl || '',
      });
    }
  }, [profile]);

  const [services, setServices] = useState<Partial<ProductService>[]>([
    { name: '', description: '', price: 0, category: '', type: 'service' }
  ]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleAddService = () => {
    setServices([...services, { name: '', description: '', price: 0, category: '', type: 'service' }]);
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleServiceChange = (index: number, field: keyof ProductService, value: any) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value };
    setServices(newServices);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'businessLogoUrl' | 'avatarUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for Base64 in Firestore
        alert("File is too large. Please choose an image under 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      // 1. Update User Profile
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        fullName: formData.fullName,
        businessName: formData.businessName,
        businessType: formData.businessType,
        industry: formData.industry,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        businessLogoUrl: formData.businessLogoUrl || `https://picsum.photos/seed/${formData.businessName}/200/200`,
        avatarUrl: formData.avatarUrl || `https://picsum.photos/seed/${formData.fullName}/200/200`,
        role: 'provider',
        isProviderSetupComplete: true,
        updatedAt: Date.now()
      });

      // 2. Add Services
      const servicesRef = collection(db, 'products_services');
      for (const service of services) {
        if (service.name && service.description) {
          await addDoc(servicesRef, {
            ...service,
            providerId: user.uid,
            providerName: formData.businessName || formData.fullName,
            providerPhone: formData.phoneNumber,
            providerEmail: formData.email,
            createdAt: Date.now()
          });
        }
      }

      navigate('/provider-dashboard');
    } catch (error) {
      console.error("Error setting up provider account:", error);
      alert("Failed to set up provider account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-4xl font-bold text-gray-900">Become a Provider</h1>
        <p className="text-gray-600">Complete your business profile to start offering services.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-12 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        {[
          { step: 1, label: 'Business Info', icon: Building2 },
          { step: 2, label: 'Branding', icon: ImageIcon },
          { step: 3, label: 'Services', icon: Package },
        ].map((s, i) => (
          <React.Fragment key={s.step}>
            <div className="flex flex-col items-center gap-2">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${step >= s.step ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-400'}`}>
                {step > s.step ? <Check className="w-6 h-6" /> : <s.icon className="w-6 h-6" />}
              </div>
              <span className={`text-xs font-bold ${step >= s.step ? 'text-blue-600' : 'text-gray-400'}`}>{s.label}</span>
            </div>
            {i < 2 && (
              <div className={`flex-1 h-1 mx-4 rounded-full transition-all ${step > s.step ? 'bg-blue-600' : 'bg-gray-100'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                        placeholder="Your Name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Business Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.businessName}
                        onChange={e => setFormData({...formData, businessName: e.target.value})}
                        placeholder="e.g. Comfort Cleaning Services"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Type of Business</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                        value={formData.businessType}
                        onChange={e => setFormData({...formData, businessType: e.target.value})}
                      >
                        <option value="">Select Type</option>
                        <option value="individual">Individual / Freelancer</option>
                        <option value="company">Registered Company</option>
                        <option value="agency">Agency</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Industry</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.industry}
                        onChange={e => setFormData({...formData, industry: e.target.value})}
                        placeholder="e.g. Home Services, Tech, Consulting"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Contact Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.phoneNumber}
                        onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        placeholder="business@example.com"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleNext}
                  disabled={!formData.businessName || !formData.businessType || !formData.industry}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Continue to Branding
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4 text-center">
                    <label className="block text-sm font-bold text-gray-700">Business Logo</label>
                    <div className="relative group mx-auto w-48 h-48">
                      <div className="w-48 h-48 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-blue-300 group-hover:bg-blue-50">
                        {formData.businessLogoUrl ? (
                          <img src={formData.businessLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <Building2 className="w-12 h-12 text-gray-300 mb-2" />
                            <span className="text-xs text-gray-400">Upload Logo</span>
                          </>
                        )}
                      </div>
                      <input 
                        type="file"
                        ref={logoInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'businessLogoUrl')}
                      />
                      <button 
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-lg border border-gray-100 p-3 rounded-2xl text-blue-600 hover:scale-110 transition-all"
                      >
                        <Upload className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Recommended: 512x512px PNG or JPG</p>
                  </div>

                  <div className="space-y-4 text-center">
                    <label className="block text-sm font-bold text-gray-700">Profile Photo</label>
                    <div className="relative group mx-auto w-48 h-48">
                      <div className="w-48 h-48 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-blue-300 group-hover:bg-blue-50">
                        {formData.avatarUrl ? (
                          <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <User className="w-12 h-12 text-gray-300 mb-2" />
                            <span className="text-xs text-gray-400">Upload Photo</span>
                          </>
                        )}
                      </div>
                      <input 
                        type="file"
                        ref={avatarInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'avatarUrl')}
                      />
                      <button 
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-lg border border-gray-100 p-3 rounded-2xl text-blue-600 hover:scale-110 transition-all"
                      >
                        <Upload className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Recommended: Square headshot</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={handleBack} className="flex-1 py-4 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all">
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                  >
                    Continue to Services
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                  {services.map((service, index) => (
                    <div key={index} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4 relative">
                      {services.length > 1 && (
                        <button 
                          onClick={() => handleRemoveService(index)}
                          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase">Offering Type</label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleServiceChange(index, 'type', 'service')}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${service.type === 'service' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-200'}`}
                            >
                              Service
                            </button>
                            <button
                              type="button"
                              onClick={() => handleServiceChange(index, 'type', 'product')}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${service.type === 'product' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-200'}`}
                            >
                              Product
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase">Category</label>
                          <select
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            value={service.category}
                            onChange={e => handleServiceChange(index, 'category', e.target.value)}
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
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase">{service.type === 'product' ? 'Product Name' : 'Service Name'}</label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={service.name}
                            onChange={e => handleServiceChange(index, 'name', e.target.value)}
                            placeholder={service.type === 'product' ? "e.g. Cleaning Kit" : "e.g. Premium House Cleaning"}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase">Price ($)</label>
                          <input
                            type="number"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={service.price}
                            onChange={e => handleServiceChange(index, 'price', Number(e.target.value))}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase">Description</label>
                          <textarea
                            rows={2}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={service.description}
                            onChange={e => handleServiceChange(index, 'description', e.target.value)}
                            placeholder={service.type === 'product' ? "Describe the product features..." : "What's included in this service?"}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleAddService}
                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 font-bold hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Another Service
                  </button>
                </div>

                <div className="flex gap-4">
                  <button onClick={handleBack} className="flex-1 py-4 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all">
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || services.some(s => !s.name || !s.description)}
                    className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Setting up Account...
                      </>
                    ) : (
                      <>
                        Complete Setup
                        <Check className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
