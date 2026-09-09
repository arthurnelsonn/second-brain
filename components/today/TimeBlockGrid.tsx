'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import HourNoteInput from './HourNoteInput';
import type { CalendarEvent, Task, DailyNote } from '@/types';

const START_HOUR = 6;
const END_HOUR   = 23;
const ROW_PX     = 64; // px per hour

interface Props {
  events:     CalendarEvent[];
  tasks:      Task[];
  notes:      DailyNote[];
  noteDate:   string;
  onNoteChange: (note: DailyNote | null, hour: number) => void;
}

// Convert a Date/timestamp to fractional hours from midnight
function toHours(ts: Date | number | null): number {
  if (!ts) return 0;
  const d = ts instanceof Date ? ts : new Date(ts);
  return d.getHours() + d.getMinutes() / 60;
}

// Pixel offset from the top of the grid (START_HOUR baseline)
function toPx(hours: number): number {
  return (hours - START_HOUR) * ROW_PX;
}

function EventBlock({ event }: { event: CalendarEvent }) {
  const top    = toPx(toHours(event.start_at));
  const bottom = toPx(toHours(event.end_at));
  const height = Math.max(bottom - top, 20);
  return (
    <div
      style={{ top, height, left: '0%', right: '0%' }}
      className="absolute mx-1 rounded-md bg-indigo-600/80 border border-indigo-500 px-2 py-1 overflow-hidden z-10"
    >
      <p className="text-xs font-medium text-white truncate">{event.title}</p>
      {event.location && <p className="text-xs text-indigo-200 truncate">{event.location}</p>}
    </div>
  );
}

function TaskBlock({ task }: { task: Task }) {
  const top    = toPx(toHours(task.scheduled_start));
  const bottom = toPx(toHours(task.scheduled_end));
  const height = Math.max(bottom - top, 20);
  return (
    <div
      style={{ top, height, left: '0%', right: '0%' }}
      className="absolute mx-1 rounded-md bg-zinc-800/80 border border-dashed border-zinc-600 px-2 py-1 overflow-hidden z-10"
    >
      <p className="text-xs font-medium text-zinc-300 truncate">{task.title}</p>
    </div>
  );
}

function CurrentTimeLine({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const [top, setTop] = useState<number | null>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function update() {
      const now = new Date();
      const hours = now.getHours() + now.getMinutes() / 60;
      if (hours < START_HOUR || hours > END_HOUR) { setTop(null); return; }
      setTop(toPx(hours));
    }
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll into view on mount
  useEffect(() => {
    if (top !== null && lineRef.current) {
      lineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [top]);

  if (top === null) return null;

  return (
    <div
      ref={lineRef}
      style={{ top }}
      className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
    >
      <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 flex-shrink-0" />
      <div className="flex-1 h-px bg-red-500" />
    </div>
  );
}

export default function TimeBlockGrid({ events, tasks, notes, noteDate, onNoteChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  // Scheduled tasks only (have scheduled_start)
  const scheduledTasks = tasks.filter((t) => t.scheduled_start != null);

  return (
    <div className="relative" ref={containerRef}>
      {/* Hour rows */}
      {hours.map((hour) => {
        const note = notes.find((n) => n.hour_block === hour);
        const label = `${hour.toString().padStart(2, '0')}:00`;
        return (
          <div
            key={hour}
            style={{ height: ROW_PX }}
            className="flex border-t border-zinc-800/60 group"
          >
            {/* Time label */}
            <div className="w-14 flex-shrink-0 pt-1 pr-3 text-right">
              <span className="text-xs text-zinc-600">{label}</span>
            </div>

            {/* Content area */}
            <div
              className={cn(
                'flex-1 relative border-l border-zinc-800/60 pl-2 pt-1',
                // Dotted background for free slots
                'bg-[radial-gradient(circle,_theme(colors.zinc.800)_1px,_transparent_1px)] bg-[size:16px_16px]',
              )}
            >
              <HourNoteInput
                hour={hour}
                noteDate={noteDate}
                existing={note}
                onSaved={(n) => onNoteChange(n, hour)}
              />
            </div>
          </div>
        );
      })}

      {/* Overlay: events and task blocks positioned absolutely over the grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ left: 56 }} // align with content area (w-14 = 56px)
      >
        <div className="relative pointer-events-auto">
          {events.map((e) => <EventBlock key={e.id} event={e} />)}
          {scheduledTasks.map((t) => <TaskBlock key={t.id} task={t} />)}
          <CurrentTimeLine containerRef={containerRef} />
        </div>
      </div>
    </div>
  );
}
