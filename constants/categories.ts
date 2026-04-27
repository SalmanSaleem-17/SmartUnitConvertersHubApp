export type CategoryConfig = {
  name: string;
  icon: string;
  description: string;
  gradient: [string, string];
  tint: string;
  tintSoft: string;
  tintSoftDark: string;
};

export const CATEGORY_ORDER: string[] = [
  'Islamic',
  'Financial',
  'Gold & Silver',
  'Health',
  'Unit',
  'Date & Time',
  'Math',
  'Construction',
  'Utility',
  'Fun',
];

export const CATEGORIES: Record<string, CategoryConfig> = {
  Islamic: {
    name: 'Islamic',
    icon: 'moon-outline',
    description: 'Zakat, Mahr, Faraiz, Salah, Qibla, Hijri & Ramadan tools.',
    gradient: ['#0EA5A5', '#0F766E'],
    tint: '#0EA5A5',
    tintSoft: '#D9F4F4',
    tintSoftDark: '#103E40',
  },
  Financial: {
    name: 'Financial',
    icon: 'trending-up',
    description: 'Loans, taxes, currency, savings & smart money tools.',
    gradient: ['#10B981', '#047857'],
    tint: '#10B981',
    tintSoft: '#D8F5E7',
    tintSoftDark: '#0E3A2A',
  },
  'Gold & Silver': {
    name: 'Gold & Silver',
    icon: 'pricetags',
    description: 'Live rates, purity, weight & karat tools for jewellers.',
    gradient: ['#F59E0B', '#B45309'],
    tint: '#F59E0B',
    tintSoft: '#FDEACB',
    tintSoftDark: '#3E2C0E',
  },
  Health: {
    name: 'Health',
    icon: 'heart',
    description: 'BMI, BMR, body fat, ovulation & wellness metrics.',
    gradient: ['#F43F5E', '#BE123C'],
    tint: '#F43F5E',
    tintSoft: '#FCE3E8',
    tintSoftDark: '#3E1822',
  },
  Unit: {
    name: 'Unit',
    icon: 'swap-horizontal',
    description: 'Length, weight, volume, area, temperature & 14+ more.',
    gradient: ['#3B82F6', '#1D4ED8'],
    tint: '#3B82F6',
    tintSoft: '#DBE7FE',
    tintSoftDark: '#0F2347',
  },
  'Date & Time': {
    name: 'Date & Time',
    icon: 'calendar',
    description: 'Age, dates, working days, timers & time zones.',
    gradient: ['#8B5CF6', '#5B21B6'],
    tint: '#8B5CF6',
    tintSoft: '#E9DEFD',
    tintSoftDark: '#26194B',
  },
  Math: {
    name: 'Math',
    icon: 'calculator',
    description: 'Scientific, fraction, percentage, statistics & more.',
    gradient: ['#6366F1', '#3730A3'],
    tint: '#6366F1',
    tintSoft: '#E0E2FE',
    tintSoftDark: '#1E1F4B',
  },
  Construction: {
    name: 'Construction',
    icon: 'construct',
    description: 'Plot area, paint, tile, concrete & material estimators.',
    gradient: ['#D97706', '#92400E'],
    tint: '#D97706',
    tintSoft: '#FCE5C5',
    tintSoftDark: '#3A210A',
  },
  Utility: {
    name: 'Utility',
    icon: 'apps',
    description: 'Password, QR, JSON, Base64 & developer tools.',
    gradient: ['#06B6D4', '#0E7490'],
    tint: '#06B6D4',
    tintSoft: '#CFF1F8',
    tintSoftDark: '#0A2E37',
  },
  Fun: {
    name: 'Fun',
    icon: 'sparkles',
    description: 'Zodiac, numerology, dice, magic 8-ball & shareables.',
    gradient: ['#EC4899', '#9D174D'],
    tint: '#EC4899',
    tintSoft: '#FDD9EA',
    tintSoftDark: '#3E1027',
  },
};

export const POPULAR_SLUGS = [
  'bmi-calculator',
  'loan-emi-calculator',
  'currency-converter',
  'percentage-calculator',
  'tip-calculator',
  'age-calculator',
  'zakat-calculator',
  'salah-times-calculator',
];
