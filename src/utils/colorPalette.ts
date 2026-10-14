export interface ColorScheme {
  id: string;
  label: string;
  hex: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  cardClasses: string;
  previewBg: string;
}

export const PROFESSIONAL_COLORS: ColorScheme[] = [
  {
    id: 'blue',
    label: 'Cobalt Blue',
    hex: '#2563eb',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-white',
    borderClass: 'border-blue-600',
    previewBg: 'bg-blue-600',
    cardClasses: 'bg-blue-50 dark:bg-blue-950/40 border-l-4 border-l-blue-600 border border-blue-200 dark:border-blue-900 text-blue-950 dark:text-blue-100'
  },
  {
    id: 'navy',
    label: 'Deep Navy',
    hex: '#1e3a8a',
    badgeBg: 'bg-blue-900',
    badgeText: 'text-white',
    borderClass: 'border-blue-900',
    previewBg: 'bg-blue-900',
    cardClasses: 'bg-blue-100 dark:bg-blue-950/60 border-l-4 border-l-blue-900 border border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-100'
  },
  {
    id: 'sky',
    label: 'Sky Azure',
    hex: '#0284c7',
    badgeBg: 'bg-sky-600',
    badgeText: 'text-white',
    borderClass: 'border-sky-600',
    previewBg: 'bg-sky-600',
    cardClasses: 'bg-sky-50 dark:bg-sky-950/40 border-l-4 border-l-sky-600 border border-sky-200 dark:border-sky-900 text-sky-950 dark:text-sky-100'
  },
  {
    id: 'cyan',
    label: 'Vibrant Cyan',
    hex: '#0891b2',
    badgeBg: 'bg-cyan-600',
    badgeText: 'text-white',
    borderClass: 'border-cyan-600',
    previewBg: 'bg-cyan-600',
    cardClasses: 'bg-cyan-50 dark:bg-cyan-950/40 border-l-4 border-l-cyan-600 border border-cyan-200 dark:border-cyan-900 text-cyan-950 dark:text-cyan-100'
  },
  {
    id: 'teal',
    label: 'Teal Mineral',
    hex: '#0d9488',
    badgeBg: 'bg-teal-600',
    badgeText: 'text-white',
    borderClass: 'border-teal-600',
    previewBg: 'bg-teal-600',
    cardClasses: 'bg-teal-50 dark:bg-teal-950/40 border-l-4 border-l-teal-600 border border-teal-200 dark:border-teal-900 text-teal-950 dark:text-teal-100'
  },
  {
    id: 'emerald',
    label: 'Emerald Green',
    hex: '#059669',
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-white',
    borderClass: 'border-emerald-600',
    previewBg: 'bg-emerald-600',
    cardClasses: 'bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-l-emerald-600 border border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-100'
  },
  {
    id: 'forest',
    label: 'Forest Pine',
    hex: '#15803d',
    badgeBg: 'bg-green-700',
    badgeText: 'text-white',
    borderClass: 'border-green-700',
    previewBg: 'bg-green-700',
    cardClasses: 'bg-green-50 dark:bg-green-950/40 border-l-4 border-l-green-700 border border-green-200 dark:border-green-900 text-green-950 dark:text-green-100'
  },
  {
    id: 'amber',
    label: 'Amber Gold',
    hex: '#d97706',
    badgeBg: 'bg-amber-600',
    badgeText: 'text-white',
    borderClass: 'border-amber-600',
    previewBg: 'bg-amber-600',
    cardClasses: 'bg-amber-50 dark:bg-amber-950/40 border-l-4 border-l-amber-600 border border-amber-200 dark:border-amber-900 text-amber-950 dark:text-amber-100'
  },
  {
    id: 'orange',
    label: 'Tangerine Orange',
    hex: '#ea580c',
    badgeBg: 'bg-orange-600',
    badgeText: 'text-white',
    borderClass: 'border-orange-600',
    previewBg: 'bg-orange-600',
    cardClasses: 'bg-orange-50 dark:bg-orange-950/40 border-l-4 border-l-orange-600 border border-orange-200 dark:border-orange-900 text-orange-950 dark:text-orange-100'
  },
  {
    id: 'crimson',
    label: 'Crimson Red',
    hex: '#dc2626',
    badgeBg: 'bg-red-600',
    badgeText: 'text-white',
    borderClass: 'border-red-600',
    previewBg: 'bg-red-600',
    cardClasses: 'bg-red-50 dark:bg-red-950/40 border-l-4 border-l-red-600 border border-red-200 dark:border-red-900 text-red-950 dark:text-red-100'
  },
  {
    id: 'wine',
    label: 'Bordeaux Wine',
    hex: '#881337',
    badgeBg: 'bg-rose-900',
    badgeText: 'text-white',
    borderClass: 'border-rose-900',
    previewBg: 'bg-rose-900',
    cardClasses: 'bg-rose-100 dark:bg-rose-950/60 border-l-4 border-l-rose-900 border border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100'
  },
  {
    id: 'rose',
    label: 'Rose Petal',
    hex: '#e11d48',
    badgeBg: 'bg-rose-600',
    badgeText: 'text-white',
    borderClass: 'border-rose-600',
    previewBg: 'bg-rose-600',
    cardClasses: 'bg-rose-50 dark:bg-rose-950/40 border-l-4 border-l-rose-600 border border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-100'
  },
  {
    id: 'indigo',
    label: 'Royal Indigo',
    hex: '#4f46e5',
    badgeBg: 'bg-indigo-600',
    badgeText: 'text-white',
    borderClass: 'border-indigo-600',
    previewBg: 'bg-indigo-600',
    cardClasses: 'bg-indigo-50 dark:bg-indigo-950/40 border-l-4 border-l-indigo-600 border border-indigo-200 dark:border-indigo-900 text-indigo-950 dark:text-indigo-100'
  },
  {
    id: 'violet',
    label: 'Electric Violet',
    hex: '#7c3aed',
    badgeBg: 'bg-violet-600',
    badgeText: 'text-white',
    borderClass: 'border-violet-600',
    previewBg: 'bg-violet-600',
    cardClasses: 'bg-violet-50 dark:bg-violet-950/40 border-l-4 border-l-violet-600 border border-violet-200 dark:border-violet-900 text-violet-950 dark:text-violet-100'
  },
  {
    id: 'purple',
    label: 'Imperial Purple',
    hex: '#9333ea',
    badgeBg: 'bg-purple-600',
    badgeText: 'text-white',
    borderClass: 'border-purple-600',
    previewBg: 'bg-purple-600',
    cardClasses: 'bg-purple-50 dark:bg-purple-950/40 border-l-4 border-l-purple-600 border border-purple-200 dark:border-purple-900 text-purple-950 dark:text-purple-100'
  },
  {
    id: 'fuchsia',
    label: 'Vivid Fuchsia',
    hex: '#c026d3',
    badgeBg: 'bg-fuchsia-600',
    badgeText: 'text-white',
    borderClass: 'border-fuchsia-600',
    previewBg: 'bg-fuchsia-600',
    cardClasses: 'bg-fuchsia-50 dark:bg-fuchsia-950/40 border-l-4 border-l-fuchsia-600 border border-fuchsia-200 dark:border-fuchsia-900 text-fuchsia-950 dark:text-fuchsia-100'
  },
  {
    id: 'slate',
    label: 'Graphite Slate',
    hex: '#475569',
    badgeBg: 'bg-slate-700',
    badgeText: 'text-white',
    borderClass: 'border-slate-700',
    previewBg: 'bg-slate-700',
    cardClasses: 'bg-slate-100 dark:bg-slate-800 border-l-4 border-l-slate-700 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100'
  },
  {
    id: 'zinc',
    label: 'Solid Charcoal',
    hex: '#27272a',
    badgeBg: 'bg-zinc-800',
    badgeText: 'text-white',
    borderClass: 'border-zinc-800',
    previewBg: 'bg-zinc-800',
    cardClasses: 'bg-zinc-100 dark:bg-zinc-800 border-l-4 border-l-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100'
  }
];

export function getColorById(id?: string): ColorScheme {
  if (!id) return PROFESSIONAL_COLORS[0];
  const found = PROFESSIONAL_COLORS.find(c => c.id.toLowerCase() === id.toLowerCase());
  return found || PROFESSIONAL_COLORS[0];
}

export function getSubjectColorId(subjectName: string, subjectsList?: { name: string; color: string }[]): string {
  if (!subjectName) return 'blue';
  if (subjectsList && subjectsList.length > 0) {
    const matched = subjectsList.find(s => s.name.toLowerCase().trim() === subjectName.toLowerCase().trim());
    if (matched && matched.color) return matched.color;
  }
  // Smart fallback based on common subject names
  const s = subjectName.toLowerCase();
  if (s.includes('physic')) return 'blue';
  if (s.includes('math') || s.includes('calc') || s.includes('algebra')) return 'crimson';
  if (s.includes('chem')) return 'emerald';
  if (s.includes('bio')) return 'teal';
  if (s.includes('cs') || s.includes('code') || s.includes('comput')) return 'indigo';
  if (s.includes('eng') || s.includes('lit')) return 'amber';
  if (s.includes('hist') || s.includes('social')) return 'orange';
  if (s.includes('gym') || s.includes('sport')) return 'forest';
  return 'slate';
}
