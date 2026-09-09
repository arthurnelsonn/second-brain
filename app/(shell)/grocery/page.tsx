'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Pencil, X, Clipboard, Trash2,
  LayoutList, Store, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GroceryItem } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Produce', 'Dairy', 'Meat', 'Bakery',
  'Frozen', 'Pantry', 'Beverages', 'Household', 'Other',
] as const;

type Category = typeof CATEGORIES[number];

const CATEGORY_COLORS: Record<string, string> = {
  Produce:    'bg-green-500/20 text-green-400',
  Dairy:      'bg-blue-500/20 text-blue-400',
  Meat:       'bg-red-500/20 text-red-400',
  Bakery:     'bg-yellow-500/20 text-yellow-400',
  Frozen:     'bg-cyan-500/20 text-cyan-400',
  Pantry:     'bg-orange-500/20 text-orange-400',
  Beverages:  'bg-purple-500/20 text-purple-400',
  Household:  'bg-zinc-500/20 text-zinc-400',
  Other:      'bg-zinc-600/20 text-zinc-500',
};

// ─── Types ────────────────────────────────────────────────────────────────────

type GroupMode = 'category' | 'store';

interface ItemFormState {
  name: string;
  quantity: string;
  unit: string;
  category: string;
  store: string;
}

const EMPTY_FORM: ItemFormState = { name: '', quantity: '', unit: '', category: '', store: '' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatQty(item: GroceryItem): string {
  const parts: string[] = [];
  if (item.quantity != null) parts.push(String(item.quantity));
  if (item.unit) parts.push(item.unit);
  return parts.join(' ');
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item) || 'Uncategorized';
    const arr = map.get(k) ?? [];
    arr.push(item);
    map.set(k, arr);
  }
  return map;
}

function buildExportText(items: GroceryItem[]): string {
  const unchecked = items.filter(i => !i.is_checked);
  const grouped = groupBy(unchecked, i => i.category || 'Other');
  const lines: string[] = ['🛒 Grocery List\n'];
  for (const [cat, catItems] of [...grouped.entries()].sort()) {
    lines.push(`${cat}:`);
    for (const item of catItems) {
      const qty = formatQty(item);
      lines.push(`  • ${item.name}${qty ? ` (${qty})` : ''}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

// ─── Add / Edit Form ──────────────────────────────────────────────────────────

interface ItemFormProps {
  initial?: ItemFormState;
  onSubmit: (data: ItemFormState) => void;
  onCancel?: () => void;
  submitLabel: string;
  loading: boolean;
}

function ItemForm({ initial = EMPTY_FORM, onSubmit, onCancel, submitLabel, loading }: ItemFormProps) {
  const [form, setForm] = useState<ItemFormState>(initial);

  function set(field: keyof ItemFormState, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Name */}
      <input
        autoFocus
        value={form.name}
        onChange={e => set('name', e.target.value)}
        placeholder="Item name *"
        className="w-full bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500 placeholder-zinc-600"
      />

      {/* Quantity + Unit */}
      <div className="flex gap-2">
        <input
          type="number"
          min="0"
          step="any"
          value={form.quantity}
          onChange={e => set('quantity', e.target.value)}
          placeholder="Qty"
          className="w-24 bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500 placeholder-zinc-600"
        />
        <input
          value={form.unit}
          onChange={e => set('unit', e.target.value)}
          placeholder="Unit (g, kg, pcs…)"
          className="flex-1 bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500 placeholder-zinc-600"
        />
      </div>

      {/* Category + Store */}
      <div className="flex gap-2">
        <select
          value={form.category}
          onChange={e => set('category', e.target.value)}
          className="flex-1 bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Category</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          value={form.store}
          onChange={e => set('store', e.target.value)}
          placeholder="Store (optional)"
          className="flex-1 bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500 placeholder-zinc-600"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!form.name.trim() || loading}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm rounded-lg transition-colors"
        >
          <Plus size={14} />
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// ─── Item Row ─────────────────────────────────────────────────────────────────

interface ItemRowProps {
  item: GroceryItem;
  onCheck: (id: number, checked: boolean) => void;
  onEdit: (item: GroceryItem) => void;
  onDelete: (id: number) => void;
}

function ItemRow({ item, onCheck, onEdit, onDelete }: ItemRowProps) {
  const qty = formatQty(item);
  const catColor = CATEGORY_COLORS[item.category ?? ''] ?? CATEGORY_COLORS.Other;

  return (
    <div className={cn(
      'flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-colors',
      item.is_checked ? 'opacity-50' : 'hover:bg-zinc-800/50',
    )}>
      {/* Checkbox */}
      <button
        onClick={() => onCheck(item.id, !item.is_checked)}
        className={cn(
          'w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors',
          item.is_checked
            ? 'bg-indigo-600 border-indigo-600'
            : 'border-zinc-600 hover:border-indigo-500',
        )}
      >
        {item.is_checked && <Check size={11} className="text-white" />}
      </button>

      {/* Name + qty */}
      <span className={cn('flex-1 text-sm', item.is_checked && 'line-through text-zinc-500')}>
        {item.name}
        {qty && <span className="text-zinc-500 ml-1.5 text-xs">{qty}</span>}
      </span>

      {/* Category badge */}
      {item.category && (
        <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium hidden sm:inline', catColor)}>
          {item.category}
        </span>
      )}

      {/* Actions — visible on hover */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(item)}
          className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors"
          title="Edit"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-700 transition-colors"
          title="Delete"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Group Section ────────────────────────────────────────────────────────────

interface GroupSectionProps {
  label: string;
  items: GroceryItem[];
  onCheck: (id: number, checked: boolean) => void;
  onEdit: (item: GroceryItem) => void;
  onDelete: (id: number) => void;
}

function GroupSection({ label, items, onCheck, onEdit, onDelete }: GroupSectionProps) {
  // Unchecked first within group
  const sorted = [...items].sort((a, b) =>
    Number(a.is_checked) - Number(b.is_checked) || a.name.localeCompare(b.name),
  );
  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-3 py-1.5">
        {label} <span className="text-zinc-700 font-normal normal-case">({items.length})</span>
      </h3>
      {sorted.map(item => (
        <ItemRow key={item.id} item={item} onCheck={onCheck} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-zinc-800 border border-zinc-700 text-white text-sm px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2">
      <Check size={14} className="text-green-400" />
      {message}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GroceryPage() {
  const qc = useQueryClient();

  const [groupMode, setGroupMode] = useState<GroupMode>('category');

  useEffect(() => {
    const stored = localStorage.getItem('pcc-grocery-group') as GroupMode | null;
    if (stored) setGroupMode(stored);
  }, []);

  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function setMode(mode: GroupMode) {
    setGroupMode(mode);
    localStorage.setItem('pcc-grocery-group', mode);
  }

  const { data: items = [], isLoading } = useQuery<GroceryItem[]>({
    queryKey: ['grocery'],
    queryFn: () => fetch('/api/grocery').then(r => r.json()),
  });

  const invalidate = useCallback(() => qc.invalidateQueries({ queryKey: ['grocery'] }), [qc]);

  const createItem = useMutation({
    mutationFn: (data: ItemFormState) =>
      fetch('/api/grocery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:     data.name,
          quantity: data.quantity ? Number(data.quantity) : null,
          unit:     data.unit || null,
          category: data.category || null,
          store:    data.store || null,
        }),
      }).then(r => r.json()),
    onSuccess: invalidate,
  });

  const updateItem = useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Partial<GroceryItem> }) =>
      fetch(`/api/grocery/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      }).then(r => r.json()),
    onSuccess: invalidate,
  });

  const deleteItem = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/grocery/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  const clearChecked = useMutation({
    mutationFn: () => fetch('/api/grocery/checked', { method: 'DELETE' }),
    onSuccess: invalidate,
  });

  function handleCheck(id: number, checked: boolean) {
    updateItem.mutate({ id, patch: { is_checked: checked } });
  }

  function handleEditSubmit(data: ItemFormState) {
    if (!editingItem) return;
    updateItem.mutate({
      id: editingItem.id,
      patch: {
        name:     data.name,
        quantity: data.quantity ? Number(data.quantity) : null,
        unit:     data.unit || null,
        category: data.category || null,
        store:    data.store || null,
      },
    });
    setEditingItem(null);
  }

  function handleExport() {
    const text = buildExportText(items);
    navigator.clipboard.writeText(text).then(() => setToast('Copied to clipboard!'));
  }

  const hasChecked = items.some(i => i.is_checked);

  // Build groups
  const grouped: Map<string, GroceryItem[]> =
    groupMode === 'category'
      ? groupBy(items, i => i.category || 'Other')
      : groupBy(items, i => i.store || 'No Store');

  // Sort group keys alphabetically
  const sortedGroups = [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="min-h-full bg-zinc-950 text-white pb-24">
      {/* Header */}
      <div className="px-4 md:px-6 pt-6 pb-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Grocery List</h1>
          <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setMode('category')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                groupMode === 'category' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white',
              )}
            >
              <LayoutList size={13} /> Category
            </button>
            <button
              onClick={() => setMode('store')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                groupMode === 'store' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white',
              )}
            >
              <Store size={13} /> Store
            </button>
          </div>
        </div>

        {/* Add form */}
        {editingItem ? (
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-700">
            <p className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wider">Editing item</p>
            <ItemForm
              initial={{
                name:     editingItem.name,
                quantity: editingItem.quantity != null ? String(editingItem.quantity) : '',
                unit:     editingItem.unit ?? '',
                category: editingItem.category ?? '',
                store:    editingItem.store ?? '',
              }}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingItem(null)}
              submitLabel="Save changes"
              loading={updateItem.isPending}
            />
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <ItemForm
              onSubmit={data => createItem.mutate(data)}
              submitLabel="Add item"
              loading={createItem.isPending}
            />
          </div>
        )}
      </div>

      {/* List */}
      <div className="px-4 md:px-6 pt-4">
        {isLoading && (
          <p className="text-zinc-500 text-sm text-center py-12">Loading…</p>
        )}

        {!isLoading && items.length === 0 && (
          <div className="text-center py-16 text-zinc-600">
            <ShoppingCartIcon />
            <p className="mt-3 text-sm">Your grocery list is empty.</p>
            <p className="text-xs mt-1">Add your first item above.</p>
          </div>
        )}

        {sortedGroups.map(([label, groupItems]) => (
          <GroupSection
            key={label}
            label={label}
            items={groupItems}
            onCheck={handleCheck}
            onEdit={setEditingItem}
            onDelete={id => deleteItem.mutate(id)}
          />
        ))}

        {/* Clear checked */}
        {hasChecked && (
          <button
            onClick={() => clearChecked.mutate()}
            disabled={clearChecked.isPending}
            className="flex items-center gap-2 mt-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 size={14} />
            Clear checked items
          </button>
        )}
      </div>

      {/* Export FAB */}
      {items.length > 0 && (
        <button
          onClick={handleExport}
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-full shadow-lg transition-colors z-40"
        >
          <Clipboard size={16} />
          Export
        </button>
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

function ShoppingCartIcon() {
  return (
    <svg className="mx-auto w-12 h-12 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}
