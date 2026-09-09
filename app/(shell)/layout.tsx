import Sidebar from '@/components/layout/Sidebar';
import PrimaryFocusBanner from '@/components/layout/PrimaryFocusBanner';
import CommandPalette from '@/components/layout/CommandPalette';
import ShellMain from '@/components/layout/ShellMain';
import MorningGuard from '@/components/layout/MorningGuard';
import QuickCapture from '@/components/brainstorm/QuickCapture';

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      <MorningGuard />
      <Sidebar />
      <ShellMain>
        <PrimaryFocusBanner />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
      </ShellMain>
      <CommandPalette />
      <QuickCapture />
    </div>
  );
}
