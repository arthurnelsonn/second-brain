'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { MorningPlan } from '@/types';

export default function MorningGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/morning') return;
    const hour = new Date().getHours();
    if (hour >= 12) return;

    fetch('/api/morning/today')
      .then(r => r.json() as Promise<MorningPlan | null>)
      .then(plan => {
        const pending = !plan || (!plan.completed_at && !plan.skipped);
        if (pending) router.replace('/morning');
      })
      .catch(() => { /* network error — don't block the user */ });
  }, [pathname, router]);

  return null;
}
