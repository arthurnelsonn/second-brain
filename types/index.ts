import type { InferSelectModel } from 'drizzle-orm';
import type {
  settings, oauthTokens, calendarSources, calendarEvents,
  tasks, morningPlans, brainDumps, emailAccounts, emails,
  projects, notes, noteLinks, dailyNotes, groceryItems, promptTemplates,
} from '@/lib/db/schema';

export type Setting = InferSelectModel<typeof settings>;
export type OAuthToken = InferSelectModel<typeof oauthTokens>;
export type CalendarSource = InferSelectModel<typeof calendarSources>;
export type CalendarEvent = InferSelectModel<typeof calendarEvents>;
export type Task = InferSelectModel<typeof tasks>;
export type MorningPlan = InferSelectModel<typeof morningPlans>;
export type BrainDump = InferSelectModel<typeof brainDumps>;
export type EmailAccount = InferSelectModel<typeof emailAccounts>;
export type Email = InferSelectModel<typeof emails>;
export type Project = InferSelectModel<typeof projects>;
export type Note = InferSelectModel<typeof notes>;
export type NoteLink = InferSelectModel<typeof noteLinks>;
export type DailyNote = InferSelectModel<typeof dailyNotes>;
export type GroceryItem = InferSelectModel<typeof groceryItems>;
export type PromptTemplate = InferSelectModel<typeof promptTemplates>;
