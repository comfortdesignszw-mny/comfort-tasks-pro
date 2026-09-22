import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'nav' | 'mobile' | 'badge';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'nav',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // If the app is already installed and opened in standalone mode, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Fallback instructions for desktop or when beforeinstallprompt has not fired yet
      setShowInfoModal(true);
    }
  };

  return (
    <>
      {variant === 'mobile' ? (
        <button
          id="pwa-install-mobile-btn"
          onClick={handleInstallClick}
          className={`w-full flex items-center justify-between px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-semibold text-sm border border-emerald-200 transition-colors ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Download className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 leading-tight">Install App</p>
              <p className="text-[11px] text-emerald-700 font-medium">Add to Home Screen & Use Offline</p>
            </div>
          </div>
          <span className="text-xs bg-emerald-600 text-white px-2.5 py-1 rounded-full font-bold">
            Install
          </span>
        </button>
      ) : (
        <button
          id="pwa-install-header-btn"
          onClick={handleInstallClick}
          title="Install Comfort Handyman as Native App"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 border ${
            isInstallable
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-emerald-200'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
          } ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      )}

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Install on iPhone / iPad</h3>
                <p className="text-xs text-emerald-600 font-semibold">Native Standalone App</p>
              </div>
            </div>

            <div className="space-y-3.5 py-2 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs border border-emerald-200">
                  1
                </div>
                <p className="text-xs leading-relaxed">
                  In Safari, tap the <strong className="text-gray-900 inline-flex items-center gap-1 font-semibold"><Share2 className="w-3.5 h-3.5 text-blue-600 inline" /> Share</strong> icon at the bottom or top bar.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs border border-emerald-200">
                  2
                </div>
                <p className="text-xs leading-relaxed">
                  Scroll down the menu and tap <strong className="text-gray-900 inline-flex items-center gap-1 font-semibold"><PlusSquare className="w-3.5 h-3.5 text-gray-800 inline" /> Add to Home Screen</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs border border-emerald-200">
                  3
                </div>
                <p className="text-xs leading-relaxed">
                  Tap <strong className="text-emerald-700 font-bold">Add</strong> in the top right. Comfort Handyman is now installed with offline access!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-200 transition active:scale-98"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Standalone / Browser Info Modal (when prompt is handled by browser icon or on desktop) */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Install Comfort Handyman</h3>
                <p className="text-xs text-emerald-600 font-semibold">Standalone PWA App</p>
              </div>
            </div>

            <div className="space-y-3 py-2 text-xs text-gray-600 leading-relaxed">
              <p>
                To install this application on your device:
              </p>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  Chrome, Edge or Android:
                </p>
                <p className="text-gray-600">
                  Click the install icon (<Download className="w-3.5 h-3.5 inline text-emerald-600" />) in your browser address bar or choose <strong>Install app</strong> from your browser menu.
                </p>
              </div>
              <p className="text-gray-500 text-[11px]">
                Once installed, the app launches in its own dedicated window without browser chrome and provides offline cache support.
              </p>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="mt-4 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
