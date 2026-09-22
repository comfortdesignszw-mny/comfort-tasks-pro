import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, MessageSquare, Share2, ExternalLink } from 'lucide-react';
import { ProductService } from '../types';

interface ShareServiceModalProps {
  service: ProductService | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareServiceModal: React.FC<ShareServiceModalProps> = ({
  service,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !service) return null;

  const shareUrl = `${window.location.origin}/services?serviceId=${service.id}`;
  const shareText = `Check out "${service.name}" for $${service.price} by ${service.providerName || 'Local Pro'} on Comfort Handyman Tasks! ${shareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: service.name,
          text: `Check out "${service.name}" on Comfort Handyman Tasks`,
          url: shareUrl,
        });
      } catch (e) {
        // ignore cancellation
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-gray-100 space-y-5"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-blue-600">
              Share Listing
            </span>
            <h3 className="text-xl font-black text-gray-900 mt-0.5 line-clamp-1">{service.name}</h3>
            <p className="text-xs text-gray-500 mt-1">
              Share this service link with friends or promote on social channels.
            </p>
          </div>

          <div className="space-y-2.5">
            {/* WhatsApp Share Button */}
            <button
              onClick={handleWhatsAppShare}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-100 transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Share to WhatsApp</span>
            </button>

            {/* Native Share API if available */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-100 transition-all active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>Share via Device Apps</span>
              </button>
            )}

            {/* Copy Link Input */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">
                Service Link
              </label>
              <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="bg-transparent text-xs text-gray-700 flex-1 px-2 outline-none select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
