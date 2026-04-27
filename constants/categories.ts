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
    gradient: ['#0D9488', '#115E59'],   // teal
    tint: '#0D9488',
    tintSoft: '#CCFBF1',
    tintSoftDark: '#0F2826',
  },
  Financial: {
    name: 'Financial',
    icon: 'trending-up',
    description: 'Loans, taxes, currency, savings & smart money tools.',
    gradient: ['#059669', '#065F46'],   // emerald
    tint: '#059669',
    tintSoft: '#D1FAE5',
    tintSoftDark: '#0A2E22',
  },
  'Gold & Silver': {
    name: 'Gold & Silver',
    icon: 'pricetags',
    description: 'Live rates, purity, weight & karat tools for jewellers.',
    gradient: ['#D97706', '#92400E'],   // amber-orange
    tint: '#D97706',
    tintSoft: '#FEF3C7',
    tintSoftDark: '#3A2607',
  },
  Health: {
    name: 'Health',
    icon: 'heart',
    description: 'BMI, BMR, body fat, ovulation & wellness metrics.',
    gradient: ['#E11D48', '#9F1239'],   // rose
    tint: '#E11D48',
    tintSoft: '#FFE4E6',
    tintSoftDark: '#3F0E1A',
  },
  Unit: {
    name: 'Unit',
    icon: 'swap-horizontal',
    description: 'Length, weight, volume, area, temperature & 14+ more.',
    gradient: ['#2563EB', '#1E40AF'],   // blue
    tint: '#2563EB',
    tintSoft: '#DBEAFE',
    tintSoftDark: '#0E1F3F',
  },
  'Date & Time': {
    name: 'Date & Time',
    icon: 'calendar',
    description: 'Age, dates, working days, timers & time zones.',
    gradient: ['#7C3AED', '#5B21B6'],   // violet
    tint: '#7C3AED',
    tintSoft: '#EDE9FE',
    tintSoftDark: '#21164D',
  },
  Math: {
    name: 'Math',
    icon: 'calculator',
    description: 'Scientific, fraction, percentage, statistics & more.',
    gradient: ['#4F46E5', '#3730A3'],   // indigo (matches primary)
    tint: '#4F46E5',
    tintSoft: '#E0E7FF',
    tintSoftDark: '#1E1B4B',
  },
  Construction: {
    name: 'Construction',
    icon: 'construct',
    description: 'Plot area, paint, tile, concrete & material estimators.',
    gradient: ['#EA580C', '#9A3412'],   // orange
    tint: '#EA580C',
    tintSoft: '#FFEDD5',
    tintSoftDark: '#3E1A05',
  },
  Utility: {
    name: 'Utility',
    icon: 'apps',
    description: 'Password, QR, JSON, Base64 & developer tools.',
    gradient: ['#0891B2', '#155E75'],   // cyan
    tint: '#0891B2',
    tintSoft: '#CFFAFE',
    tintSoftDark: '#082F37',
  },
  Fun: {
    name: 'Fun',
    icon: 'sparkles',
    description: 'Zodiac, numerology, dice, magic 8-ball & shareables.',
    gradient: ['#DB2777', '#9D174D'],   // pink (matches accent)
    tint: '#DB2777',
    tintSoft: '#FCE7F3',
    tintSoftDark: '#3E0D26',
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
