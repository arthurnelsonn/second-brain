'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useAppStore } from '@/store';
import type { MorningPlan } from '@/types';

export default function PrimaryFocusBanner() {
  const { primaryFocus, setPrimaryFocus } = useAppStore();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/morning/today')
      .then((r) => r.json())
      .then((plan: MorningPlan | null) => {
        if (plan?.primary_focus) setPrimaryFocus(plan.primary_focus);
      })
      .catch(() => null);
  }, [setPrimaryFocus]);

  if (!primaryFocus || dismissed) return null;

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2 bg-indigo-950 border-b border-indigo-800 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-indigo-400 font-medium flex-shrink-0">Today&apos;s focus:</span>
        <span className="text-white truncate">{primaryFocus}</span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        title="Dismiss focus banner"
        className="flex-shrink-0 p-1 rounded hover:bg-indigo-800 text-indigo-400 hover:text-white transition-colors"
      >
        <Check size={14} />
      </button>
    </div>
  );
}
