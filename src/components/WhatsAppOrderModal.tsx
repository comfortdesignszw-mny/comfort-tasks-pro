import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MessageSquare, 
  MapPin, 
  Phone, 
  User, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Send, 
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProductService, WhatsAppOrder } from '../types';
import { POPULAR_HOODS, formatWhatsAppLink } from '../constants/neighborhoods';

interface WhatsAppOrderModalProps {
  service: ProductService | null;
  isOpen: boolean;
  onClose: () => void;
  defaultHood?: string;
}

export const WhatsAppOrderModal: React.FC<WhatsAppOrderModalProps> = ({
  service,
  isOpen,
  onClose,
  defaultHood = ''
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsApp, setCustomerWhatsApp] = useState('');
  const [customerHood, setCustomerHood] = useState(defaultHood || '');
  const [urgency, setUrgency] = useState('Today (As soon as possible)');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState('');

  // Load cached customer info from localStorage if available
  useEffect(() => {
    try {
      const cached = localStorage.getItem('comfort_handyman_customer');
      if (cached) {
        const data = JSON.parse(cached);
        if (data.name) setCustomerName(data.name);
        if (data.whatsapp) setCustomerWhatsApp(data.whatsapp);
        if (data.hood && !customerHood) setCustomerHood(data.hood);
      }
    } catch (e) {
      console.warn("Could not read customer cache", e);
    }
  }, []);

  useEffect(() => {
    if (defaultHood && (!customerHood || customerHood === 'All Hoods')) {
      setCustomerHood(defaultHood === 'All Hoods' ? '' : defaultHood);
    }
  }, [defaultHood]);

  if (!isOpen || !service) return null;

  const targetWhatsApp = service.providerWhatsApp || service.providerPhone || '1234567890';

  const handleSendOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerWhatsApp.trim()) {
      alert("Please enter your name and WhatsApp number so the provider can reach you.");
      return;
    }

    setIsSubmitting(true);

    // Cache customer info locally for instant future 1-tap orders
    try {
      localStorage.setItem('comfort_handyman_customer', JSON.stringify({
        name: customerName,
        whatsapp: customerWhatsApp,
        hood: customerHood
      }));
    } catch (e) {
      // ignore
    }

    // Construct WhatsApp message text
    const message = `🛠️ *SERVICE ORDER REQUEST*
*Comfort Handyman Tasks*
----------------------------------------
📌 *Service:* ${service.name} (${service.category})
💰 *Estimated Price:* $${service.price}
🏷️ *Type:* ${service.type.toUpperCase()}

👤 *Customer Name:* ${customerName}
📱 *Customer WhatsApp:* ${customerWhatsApp}
📍 *Customer Hood/Location:* ${customerHood || 'Local'}
⏰ *When Needed:* ${urgency}

📝 *Task Details & Requirements:*
${notes ? notes : 'Standard service request - please confirm availability and arrival time.'}
----------------------------------------
_Ordered via Comfort Handyman Tasks (1-Tap Local Order)_`;

    const waUrl = formatWhatsAppLink(targetWhatsApp, message);
    setLastWhatsAppUrl(waUrl);

    // Record order in Firestore (for provider dashboard tracking)
    try {
      await addDoc(collection(db, 'whatsapp_orders'), {
        serviceId: service.id,
        serviceName: service.name,
        serviceCategory: service.category,
        servicePrice: service.price,
        providerId: service.providerId,
        providerName: service.providerName || 'Service Provider',
        providerWhatsApp: targetWhatsApp,
        customerName: customerName,
        customerWhatsApp: customerWhatsApp,
        customerHood: customerHood || 'Local',
        customerNotes: notes,
        urgency: urgency,
        timestamp: Date.now()
      } as WhatsAppOrder);
    } catch (error) {
      console.warn("Could not save order log to database, proceeding to open WhatsApp", error);
    }

    // Open WhatsApp in new tab / mobile app
    window.open(waUrl, '_blank');

    setIsSubmitting(false);
    setOrderSent(true);
  };

  const handleReset = () => {
    setOrderSent(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-8"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 1-Tap WhatsApp Order
              </span>
              <span className="text-emerald-100 text-xs">No account required</span>
            </div>
            <h2 className="text-2xl font-bold">{service.name}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-emerald-100">
              <span>By <strong className="text-white">{service.providerName || 'Local Handyman Pro'}</strong></span>
              <span>•</span>
              <span className="text-white font-bold text-base bg-emerald-700/50 px-2 py-0.5 rounded-lg">${service.price}</span>
              {service.providerHood && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-white"><MapPin className="w-3.5 h-3.5" /> {service.providerHood}</span>
                </>
              )}
            </div>
          </div>

          {/* Body */}
          {orderSent ? (
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp Order Initiated!</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Your order details and WhatsApp number have been dispatched to <strong>{service.providerName}</strong>.
                  If your WhatsApp did not open automatically, tap the button below:
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <a
                  href={lastWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 transition-all"
                >
                  <MessageSquare className="w-5 h-5" />
                  Open WhatsApp Chat Again
                </a>
                <button
                  onClick={handleReset}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 px-6 rounded-2xl transition-all"
                >
                  Done
                </button>
              </div>

              <div className="text-xs text-gray-400 flex items-center justify-center gap-1 pt-4 border-t border-gray-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                The provider will confirm booking and arrival directly on WhatsApp with you.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendOrder} className="p-6 md:p-8 space-y-5">
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 text-sm text-emerald-900 flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  Orders connect directly to the provider's WhatsApp. Your WhatsApp number serves as your client ID so you can discuss details and confirm speed jobs directly.
                </p>
              </div>

              {/* Customer WhatsApp and Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Moyo"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Your WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="+263 77 123 4567"
                      value={customerWhatsApp}
                      onChange={(e) => setCustomerWhatsApp(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-gray-500">Used by the handyman to reply to your order</span>
                </div>
              </div>

              {/* Neighborhood / Hood */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Your Neighborhood / Hood</span>
                  <span className="text-emerald-600 font-normal lowercase">for local & speed matching</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Avondale, Borrowdale, CBD, Brooklyn..."
                    value={customerHood}
                    onChange={(e) => setCustomerHood(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                {/* Popular Hood Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {POPULAR_HOODS.slice(1, 7).map((hood) => (
                    <button
                      key={hood}
                      type="button"
                      onClick={() => setCustomerHood(hood)}
                      className={`text-xs px-2 py-0.5 rounded-md transition-colors ${
                        customerHood.toLowerCase() === hood.toLowerCase()
                          ? 'bg-emerald-600 text-white font-medium'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {hood}
                    </button>
                  ))}
                </div>
              </div>

              {/* When Needed / Urgency */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  When do you need this done?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    'As soon as possible (Speed)',
                    'Today',
                    'Tomorrow',
                    'Flexible'
                  ].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setUrgency(option)}
                      className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        urgency === option
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific Details */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Specific Requirements or Address Details (Optional)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <textarea
                    rows={2}
                    placeholder="Describe what needs fixing, specific room or location details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>1-Tap Order via WhatsApp (${service.price})</span>
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-gray-400 mt-2">
                  Direct connection with {service.providerName} • Instant WhatsApp message generated
                </p>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
