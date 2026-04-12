import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  Calendar, 
  FileText,
  CheckCircle2
} from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { CATEGORIES } from '../constants/categories';
import { useAuth } from '../hooks/useAuth';

export default function PostTask() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    budget: '',
    date: ''
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setIsSubmitting(true);
    try {
      const tasksRef = collection(db, 'tasks');
      const newTaskRef = doc(tasksRef);
      
      await setDoc(newTaskRef, {
        id: newTaskRef.id,
        customerId: auth.currentUser.uid,
        customerName: profile?.fullName || 'Anonymous',
        customerAvatarUrl: profile?.avatarUrl || '',
        customerPhone: profile?.phoneNumber || '',
        customerEmail: profile?.email || '',
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        budget: Number(formData.budget),
        status: 'open',
        date: new Date(formData.date).getTime(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      setStep(4); // Success step
    } catch (error) {
      console.error("Error posting task:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-3xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-100 flex">
          <div 
            className="h-full bg-blue-600 transition-all duration-500" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-8 md:p-12">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">What do you need help with?</h2>
                <p className="text-gray-500">Pick a category that best fits your task.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setFormData({ ...formData, category: cat.name });
                      nextStep();
                    }}
                    className={`p-6 rounded-2xl border-2 transition-all text-center group ${formData.category === cat.name ? 'border-blue-600 bg-blue-50' : 'border-gray-50 hover:border-blue-200 hover:bg-gray-50'}`}
                  >
                    <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">
                      {cat.name === 'Cleaning' ? '✨' : 
                       cat.name === 'Plumbing' ? '🚰' : 
                       cat.name === 'Electrical' ? '⚡' : 
                       cat.name === 'Assembly' ? '📦' : '🛠️'}
                    </span>
                    <span className="font-bold text-sm text-gray-900">{cat.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Tell us more</h2>
                <p className="text-gray-500">The more details, the better offers you'll get.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Task Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Fix leaking faucet in bathroom"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Describe what needs to be done..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={prevStep} className="flex-1 py-4 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all">
                  Back
                </button>
                <button 
                  onClick={nextStep}
                  disabled={!formData.title || !formData.description}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Final details</h2>
                <p className="text-gray-500">Where and when should this happen?</p>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Location"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    placeholder="Budget ($)"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={prevStep} className="flex-1 py-4 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all">
                  Back
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={!formData.location || !formData.budget || !formData.date || isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Posting...
                    </>
                  ) : 'Post Task'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-6"
            >
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900">Task Posted!</h2>
              <p className="text-xl text-gray-600">Your task is now live. We'll notify you when providers start making offers.</p>
              <div className="pt-8">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
                >
                  Go to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
