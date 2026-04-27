// Lightweight network helpers + free public APIs used by the website.
// All endpoints below are key-less and CORS-friendly so they work straight
// from the device.

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.json() as Promise<T>;
}

// ---------- Gold / Silver spot prices (gold-api.com) ----------
export type MetalPrice = {
  name: string;
  price: number;     // USD per troy ounce
  symbol: string;
  updatedAt: string;
};

export async function fetchGoldSilver(): Promise<{ gold: MetalPrice; silver: MetalPrice }> {
  const [gold, silver] = await Promise.all([
    getJson<MetalPrice>('https://api.gold-api.com/price/XAU/USD'),
    getJson<MetalPrice>('https://api.gold-api.com/price/XAG/USD'),
  ]);
  return { gold, silver };
}

// ---------- Salah Times (api.aladhan.com) ----------
export type SalahTimings = {
  Fajr: string; Sunrise: string; Dhuhr: string; Asr: string;
  Sunset: string; Maghrib: string; Isha: string; Imsak: string; Midnight: string;
};

export async function fetchSalahTimes(opts: {
  date?: string;            // DD-MM-YYYY (defaults today)
  latitude: number;
  longitude: number;
  method?: number;          // calculation method, default 2 (ISNA)
}): Promise<{ timings: SalahTimings; date: { readable: string; hijri: { date: string } } }> {
  const date = opts.date ?? formatTodayAladhan();
  const url = new URL(`https://api.aladhan.com/v1/timings/${date}`);
  url.searchParams.set('latitude', String(opts.latitude));
  url.searchParams.set('longitude', String(opts.longitude));
  url.searchParams.set('method', String(opts.method ?? 2));
  const res = await getJson<{ data: { timings: SalahTimings; date: any } }>(url.toString());
  return res.data;
}

function formatTodayAladhan() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

// ---------- Geocoding & Weather (open-meteo.com) ----------
export type GeoMatch = {
  id: number; name: string; latitude: number; longitude: number;
  country: string; admin1?: string; timezone?: string;
};

export async function geocodeCity(query: string, count = 8): Promise<GeoMatch[]> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', query);
  url.searchParams.set('count', String(count));
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');
  const res = await getJson<{ results?: GeoMatch[] }>(url.toString());
  return res.results ?? [];
}

export type WeatherNow = {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  is_day: number;
  time: string;
};

export async function fetchWeather(lat: number, lon: number): Promise<{ current: WeatherNow }> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current_weather', 'true');
  return getJson(url.toString());
}
