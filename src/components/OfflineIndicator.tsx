import React from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-indicator-banner"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-3 rounded-2xl bg-amber-600 text-white px-4 py-3 shadow-2xl border border-amber-500/40 animate-bounce-short"
    >
      <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
        <WifiOff className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 text-xs">
        <p className="font-bold">Offline Mode Active</p>
        <p className="text-amber-100 text-[11px] leading-tight mt-0.5">
          You are viewing cached services & offline tasks. Reconnect to sync latest updates.
        </p>
      </div>
    </div>
  );
};
