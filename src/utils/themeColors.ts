/**
 * Curated Human-Designed Color System for Students
 * Engineered for high legibility, calm focus, and zero eye fatigue.
 */

export type PaletteTheme = 'studio' | 'swiss' | 'nordic' | 'amber';

export interface SubjectColorDef {
  id: string;
  name: string;
  accentHex: string;
  lightBg: string;
  lightBorder: string;
  lightText: string;
  darkBg: string;
  darkBorder: string;
  darkText: string;
}

export const SUBJECT_COLORS: Record<string, SubjectColorDef> = {
  blue: {
    id: 'blue',
    name: 'Cobalt (Mathematics & Tech)',
    accentHex: '#2A4CEB',
    lightBg: '#F0F4FE',
    lightBorder: '#3259E8',
    lightText: '#1836B2',
    darkBg: '#151C33',
    darkBorder: '#3F64FF',
    darkText: '#DCE5FF'
  },
  emerald: {
    id: 'emerald',
    name: 'Sage (Natural Sciences)',
    accentHex: '#1E6F5C',
    lightBg: '#F0F7F4',
    lightBorder: '#237B66',
    lightText: '#114D3F',
    darkBg: '#12241D',
    darkBorder: '#2FA88D',
    darkText: '#D1F5EB'
  },
  amber: {
    id: 'amber',
    name: 'Ochre (Humanities & Social)',
    accentHex: '#B86508',
    lightBg: '#FEF8F0',
    lightBorder: '#C97412',
    lightText: '#7A3F00',
    darkBg: '#2B1B0A',
    darkBorder: '#E58A22',
    darkText: '#FDE7CD'
  },
  rose: {
    id: 'rose',
    name: 'Terracotta (Arts & History)',
    accentHex: '#C04222',
    lightBg: '#FFF3F0',
    lightBorder: '#D14F2E',
    lightText: '#872810',
    darkBg: '#2E120A',
    darkBorder: '#EB5C36',
    darkText: '#FDDDD5'
  },
  violet: {
    id: 'violet',
    name: 'Mulberry (Literature & Lang)',
    accentHex: '#7434B8',
    lightBg: '#F8F2FE',
    lightBorder: '#8442CD',
    lightText: '#4F1E85',
    darkBg: '#211033',
    darkBorder: '#9E58E8',
    darkText: '#EDDCFE'
  },
  slate: {
    id: 'slate',
    name: 'Graphite (Study & Fitness)',
    accentHex: '#48443E',
    lightBg: '#F5F4F1',
    lightBorder: '#5E5952',
    lightText: '#262421',
    darkBg: '#1F1E1C',
    darkBorder: '#6E6961',
    darkText: '#E6E4DF'
  }
};

export const PALETTES: { id: PaletteTheme; name: string; previewAccent: string; desc: string }[] = [
  {
    id: 'studio',
    name: 'Studio Paper',
    previewAccent: '#2A4CEB',
    desc: 'Warm Alabaster paper with deep charcoal ink and Cobalt blue focus'
  },
  {
    id: 'swiss',
    name: 'Swiss Bauhaus',
    previewAccent: '#E11D48',
    desc: 'High-contrast chalk white and dark slate with Dieter Rams Vermilion'
  },
  {
    id: 'nordic',
    name: 'Nordic Pine',
    previewAccent: '#1E6F5C',
    desc: 'Calm mist and deep pine wood with grounding sage green'
  },
  {
    id: 'amber',
    name: 'Warm Espresso',
    previewAccent: '#B86208',
    desc: 'Parchment and roasted espresso with warm ochre amber'
  }
];
