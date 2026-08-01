import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const settings = sqliteTable('settings', {
  key:        text('key').primaryKey(),
  value:      text('value').notNull(),
  updated_at: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const oauthTokens = sqliteTable('oauth_tokens', {
  id:            integer('id').primaryKey({ autoIncrement: true }),
  provider:      text('provider').notNull(),
  account_email: text('account_email'),
  access_token:  text('access_token').notNull(),
  refresh_token: text('refresh_token'),
  expires_at:    integer('expires_at', { mode: 'timestamp' }),
  scope:         text('scope'),
  created_at:    integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updated_at:    integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const calendarSources = sqliteTable('calendar_sources', {
  id:             integer('id').primaryKey({ autoIncrement: true }),
  provider:       text('provider').notNull(),
  calendar_id:    text('calendar_id').notNull(),
  name:           text('name').notNull(),
  color:          text('color').notNull().default('#4285F4'),
  is_enabled:     integer('is_enabled', { mode: 'boolean' }).default(true),
  sync_token:     text('sync_token'),
  last_synced:    integer('last_synced', { mode: 'timestamp' }),
  oauth_token_id: integer('oauth_token_id').references(() => oauthTokens.id),
});

export const calendarEvents = sqliteTable('calendar_events', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  external_id: text('external_id'),
  source_id:   integer('source_id').references(() => calendarSources.id),
  title:       text('title').notNull(),
  description: text('description'),
  location:    text('location'),
  video_url:   text('video_url'),
  start_at:    integer('start_at', { mode: 'timestamp' }).notNull(),
  end_at:      integer('end_at', { mode: 'timestamp' }).notNull(),
  is_all_day:  integer('is_all_day', { mode: 'boolean' }).default(false),
  rrule:       text('rrule'),
  attendees:   text('attendees'),
  status:      text('status').default('confirmed'),
  raw_data:    text('raw_data'),
  created_at:  integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updated_at:  integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const tasks = sqliteTable('tasks', {
  id:              integer('id').primaryKey({ autoIncrement: true }),
  external_id:     text('external_id'),
  source:          text('source').notNull().default('local'),
  title:           text('title').notNull(),
  description:     text('description'),
  project:         text('project'),
  labels:          text('labels'),
  priority:        integer('priority').default(4),
  due_at:          integer('due_at', { mode: 'timestamp' }),
  scheduled_start: integer('scheduled_start', { mode: 'timestamp' }),
  scheduled_end:   integer('scheduled_end', { mode: 'timestamp' }),
  completed_at:    integer('completed_at', { mode: 'timestamp' }),
  is_synced:       integer('is_synced', { mode: 'boolean' }).default(false),
  raw_data:        text('raw_data'),
  created_at:      integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updated_at:      integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const morningPlans = sqliteTable('morning_plans', {
  id:             integer('id').primaryKey({ autoIncrement: true }),
  plan_date:      text('plan_date').notNull().unique(),
  primary_focus:  text('primary_focus'),
  reflection:     text('reflection'),
  skipped:        integer('skipped', { mode: 'boolean' }).default(false),
  ai_suggestions: text('ai_suggestions'),
  email_brief:    text('email_brief'),
  completed_at:   integer('completed_at', { mode: 'timestamp' }),
  created_at:     integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const brainDumps = sqliteTable('brain_dumps', {
  id:               integer('id').primaryKey({ autoIncrement: true }),
  content:          text('content').notNull(),
  mode:             text('mode'),
  ai_response:      text('ai_response'),
  is_quick_capture: integer('is_quick_capture', { mode: 'boolean' }).default(false),
  saved_note_id:    integer('saved_note_id'),
  created_at:       integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const emailAccounts = sqliteTable('email_accounts', {
  id:             integer('id').primaryKey({ autoIncrement: true }),
  type:           text('type').notNull(),
  email:          text('email').notNull(),
  display_name:   text('display_name'),
  color:          text('color').default('#EA4335'),
  imap_host:      text('imap_host'),
  imap_port:      integer('imap_port'),
  smtp_host:      text('smtp_host'),
  smtp_port:      integer('smtp_port'),
  oauth_token_id: integer('oauth_token_id').references(() => oauthTokens.id),
  last_synced:    integer('last_synced', { mode: 'timestamp' }),
  is_enabled:     integer('is_enabled', { mode: 'boolean' }).default(true),
});

export const emails = sqliteTable('emails', {
  id:           integer('id').primaryKey({ autoIncrement: true }),
  account_id:   integer('account_id').references(() => emailAccounts.id),
  message_id:   text('message_id').notNull(),
  thread_id:    text('thread_id'),
  subject:      text('subject'),
  from_name:    text('from_name'),
  from_email:   text('from_email'),
  to_addresses: text('to_addresses'),
  cc_addresses: text('cc_addresses'),
  body_plain:   text('body_plain'),
  body_html:    text('body_html'),
  snippet:      text('snippet'),
  is_read:      integer('is_read', { mode: 'boolean' }).default(false),
  is_flagged:   integer('is_flagged', { mode: 'boolean' }).default(false),
  is_archived:  integer('is_archived', { mode: 'boolean' }).default(false),
  ai_summary:   text('ai_summary'),
  received_at:  integer('received_at', { mode: 'timestamp' }),
  created_at:   integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const projects = sqliteTable('projects', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  name:        text('name').notNull(),
  description: text('description'),
  color:       text('color').default('#6366F1'),
  icon:        text('icon'),
  is_archived: integer('is_archived', { mode: 'boolean' }).default(false),
  sort_order:  integer('sort_order').default(0),
  created_at:  integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const notes = sqliteTable('notes', {
  id:         integer('id').primaryKey({ autoIncrement: true }),
  project_id: integer('project_id').references(() => projects.id),
  title:      text('title').notNull(),
  content:    text('content'),
  is_pinned:  integer('is_pinned', { mode: 'boolean' }).default(false),
  tags:       text('tags'),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const noteLinks = sqliteTable('note_links', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  note_id:     integer('note_id').references(() => notes.id),
  linked_type: text('linked_type'),
  linked_id:   integer('linked_id'),
});

export const dailyNotes = sqliteTable('daily_notes', {
  id:         integer('id').primaryKey({ autoIncrement: true }),
  note_date:  text('note_date').notNull(),
  hour_block: integer('hour_block'),
  content:    text('content').notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const groceryItems = sqliteTable('grocery_items', {
  id:               integer('id').primaryKey({ autoIncrement: true }),
  name:             text('name').notNull(),
  quantity:         real('quantity'),
  unit:             text('unit'),
  category:         text('category'),
  store:            text('store'),
  is_checked:       integer('is_checked', { mode: 'boolean' }).default(false),
  is_recurring:     integer('is_recurring', { mode: 'boolean' }).default(false),
  recur_every_days: integer('recur_every_days'),
  next_recur_at:    integer('next_recur_at', { mode: 'timestamp' }),
  created_at:       integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const promptTemplates = sqliteTable('prompt_templates', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  name:        text('name').notNull().unique(),
  system:      text('system').notNull(),
  user_prefix: text('user_prefix'),
  model:       text('model').default('gemini-2.0-flash'),
  version:     integer('version').default(1),
  created_at:  integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});
