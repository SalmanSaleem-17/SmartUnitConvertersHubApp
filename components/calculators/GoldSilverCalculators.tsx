import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Picker } from '@/components/ui/Picker';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { ResultDisplay } from '@/components/ui/ResultDisplay';
import { fetchGoldSilver, type MetalPrice } from '@/lib/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

// ---------- Live Gold & Silver Rates ----------
export function LiveGoldRatesTool() {
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? Colors.dark : Colors.light;
  const [data, setData] = useState<{ gold: MetalPrice; silver: MetalPrice } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  async function load() {
    setLoading(true); setError(null);
    try {
      const d = await fetchGoldSilver();
      setData(d);
      setRefreshedAt(new Date());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <View className="gap-3">
      <Card>
        <Text variant="bodyStrong">Live spot prices</Text>
        <Text variant="small" tone="muted" className="mt-1">
          Source: gold-api.com (XAU/USD, XAG/USD). Prices in USD per troy ounce.
        </Text>
      </Card>

      {loading && !data ? (
        <Card className="items-center py-6">
          <ActivityIndicator color={tokens.primary} />
          <Text variant="small" tone="muted" className="mt-2">Fetching live rates…</Text>
        </Card>
      ) : null}

      {error ? <Card><Text variant="bodyStrong" tone="danger">{error}</Text></Card> : null}

      {data ? (
        <>
          <ResultDisplay
            label="Gold (XAU/USD)"
            value={`$${data.gold.price.toFixed(2)}`}
            sub={`per troy oz · ${data.gold.symbol}`}
          />
          <ResultDisplay
            emphasize={false}
            label="Silver (XAG/USD)"
            value={`$${data.silver.price.toFixed(2)}`}
            sub={`per troy oz · ${data.silver.symbol}`}
          />
          <Card variant="subtle">
            <Text variant="caption" tone="muted">
              Last refreshed: {refreshedAt?.toLocaleTimeString() ?? '—'}
            </Text>
          </Card>
        </>
      ) : null}

      <Button title={loading ? 'Refreshing…' : 'Refresh now'} icon="refresh" onPress={load} fullWidth />
    </View>
  );
}

// ---------- Gold Price Calculator ----------
const PURITIES = [
  { label: '24K (99.9%)', value: '24', factor: 0.999 },
  { label: '22K (91.6%)', value: '22', factor: 0.916 },
  { label: '21K (87.5%)', value: '21', factor: 0.875 },
  { label: '18K (75.0%)', value: '18', factor: 0.75 },
  { label: '14K (58.5%)', value: '14', factor: 0.585 },
  { label: '10K (41.7%)', value: '10', factor: 0.417 },
];

const GRAM_PER_TROY_OZ = 31.1034768;
const GRAM_PER_TOLA = 11.6638;

export function GoldPriceCalculator() {
  const [pricePerOzUsd, setPriceUsd] = useState('2300');
  const [usdToLocal, setUsdToLocal] = useState('278');  // PKR default
  const [purity, setPurity] = useState('22');
  const [weightGrams, setWeight] = useState('10');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchSpot() {
    setLoading(true); setError(null);
    try {
      const d = await fetchGoldSilver();
      setPriceUsd(d.gold.price.toFixed(2));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { fetchSpot(); }, []);

  const out = useMemo(() => {
    const usdPerOz = parseFloat(pricePerOzUsd);
    const fx = parseFloat(usdToLocal);
    const w = parseFloat(weightGrams);
    const p = PURITIES.find((x) => x.value === purity);
    if (!isFinite(usdPerOz) || !isFinite(fx) || !isFinite(w) || !p) return null;
    const localPerGram = (usdPerOz / GRAM_PER_TROY_OZ) * fx;
    const adjPerGram = localPerGram * p.factor;
    return {
      gramPure: localPerGram,
      gramAtPurity: adjPerGram,
      total: adjPerGram * w,
      perTola: adjPerGram * GRAM_PER_TOLA,
    };
  }, [pricePerOzUsd, usdToLocal, purity, weightGrams]);

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Spot price (USD per troy oz)" value={pricePerOzUsd} onChangeText={setPriceUsd} keyboardType="decimal-pad" icon="logo-usd" />
          <Button title={loading ? 'Refreshing…' : 'Use live spot price'} icon="refresh" onPress={fetchSpot} variant="secondary" size="sm" />
          {error ? <Text variant="small" tone="danger">{error}</Text> : null}
          <Input label="USD → local currency rate" value={usdToLocal} onChangeText={setUsdToLocal} keyboardType="decimal-pad" hint="e.g. 278 for PKR, 83 for INR, 1 if you want USD output" />
          <Picker
            label="Purity (karat)"
            value={purity}
            onChange={setPurity}
            options={PURITIES.map((p) => ({ label: p.label, value: p.value }))}
          />
          <Input label="Weight (grams)" value={weightGrams} onChangeText={setWeight} keyboardType="decimal-pad" icon="barbell" />
        </View>
      </Card>

      <ResultDisplay label="Total value" value={out ? fmt(out.total) : '—'} sub={out ? `for ${weightGrams} g of ${purity}K gold` : undefined} />
      {out ? (
        <Card variant="subtle">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text variant="caption" tone="muted">PER GRAM (PURE)</Text>
              <Text variant="h3" className="mt-0.5">{fmt(out.gramPure)}</Text>
            </View>
            <View className="flex-1">
              <Text variant="caption" tone="muted">PER GRAM ({purity}K)</Text>
              <Text variant="h3" className="mt-0.5">{fmt(out.gramAtPurity)}</Text>
            </View>
          </View>
          <View className="mt-3">
            <Text variant="caption" tone="muted">PER TOLA ({purity}K)</Text>
            <Text variant="h2" className="mt-0.5">{fmt(out.perTola)}</Text>
          </View>
        </Card>
      ) : null}
    </View>
  );
}

// ---------- Silver Price Calculator ----------
export function SilverPriceCalculator() {
  const [pricePerOzUsd, setPriceUsd] = useState('27');
  const [usdToLocal, setUsdToLocal] = useState('278');
  const [weightGrams, setWeight] = useState('100');
  const [purityPct, setPurityPct] = useState('92.5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchSpot() {
    setLoading(true); setError(null);
    try {
      const d = await fetchGoldSilver();
      setPriceUsd(d.silver.price.toFixed(3));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { fetchSpot(); }, []);

  const out = useMemo(() => {
    const oz = parseFloat(pricePerOzUsd);
    const fx = parseFloat(usdToLocal);
    const w = parseFloat(weightGrams);
    const p = parseFloat(purityPct) / 100;
    if (![oz, fx, w, p].every(isFinite)) return null;
    const gram = (oz / GRAM_PER_TROY_OZ) * fx;
    const adj = gram * p;
    return { gram, adj, total: adj * w, perTola: adj * GRAM_PER_TOLA };
  }, [pricePerOzUsd, usdToLocal, weightGrams, purityPct]);

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Spot price (USD/oz)" value={pricePerOzUsd} onChangeText={setPriceUsd} keyboardType="decimal-pad" icon="logo-usd" />
          <Button title={loading ? 'Refreshing…' : 'Use live spot price'} icon="refresh" onPress={fetchSpot} variant="secondary" size="sm" />
          {error ? <Text variant="small" tone="danger">{error}</Text> : null}
          <Input label="USD → local currency rate" value={usdToLocal} onChangeText={setUsdToLocal} keyboardType="decimal-pad" />
          <Input label="Purity (%)" value={purityPct} onChangeText={setPurityPct} keyboardType="decimal-pad" hint="Common: 99.9 (fine) · 92.5 (sterling) · 80 (coin)" />
          <Input label="Weight (grams)" value={weightGrams} onChangeText={setWeight} keyboardType="decimal-pad" icon="barbell" />
        </View>
      </Card>
      <ResultDisplay label="Total value" value={out ? fmt(out.total) : '—'} sub={out ? `${weightGrams} g · ${purityPct}% pure` : undefined} />
      {out ? (
        <Card variant="subtle">
          <View className="flex-row gap-3">
            <View className="flex-1"><Text variant="caption" tone="muted">PER GRAM</Text><Text variant="h3" className="mt-0.5">{fmt(out.adj)}</Text></View>
            <View className="flex-1"><Text variant="caption" tone="muted">PER TOLA</Text><Text variant="h3" className="mt-0.5">{fmt(out.perTola)}</Text></View>
          </View>
        </Card>
      ) : null}
    </View>
  );
}

// ---------- Gold Purity Calculator ----------
export function GoldPurityCalculator() {
  const [karat, setKarat] = useState('22');
  const k = parseFloat(karat);
  const purityPct = isFinite(k) && k >= 0 && k <= 24 ? (k / 24) * 100 : null;
  const millesimal = purityPct === null ? null : Math.round(purityPct * 10);
  return (
    <View className="gap-3">
      <Card>
        <Input label="Karat (0–24)" value={karat} onChangeText={setKarat} keyboardType="decimal-pad" />
      </Card>
      <ResultDisplay label="Purity %" value={purityPct === null ? '—' : `${purityPct.toFixed(2)}%`} sub={millesimal === null ? undefined : `Millesimal fineness: ${millesimal}`} />
    </View>
  );
}

// ---------- Karat Adjustment ----------
export function KaratAdjustmentCalculator() {
  const [weight, setWeight] = useState('20');
  const [fromK, setFromK] = useState('24');
  const [toK, setToK] = useState('22');
  const out = useMemo(() => {
    const w = parseFloat(weight);
    const a = parseFloat(fromK); const b = parseFloat(toK);
    if (![w, a, b].every(isFinite) || a <= 0 || b <= 0) return null;
    const newWeight = (w * a) / b;
    const alloyAdded = newWeight - w;
    return { newWeight, alloyAdded };
  }, [weight, fromK, toK]);
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Pure gold weight (g)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
          <Input label="From karat" value={fromK} onChangeText={setFromK} keyboardType="decimal-pad" />
          <Input label="Target karat" value={toK} onChangeText={setToK} keyboardType="decimal-pad" />
        </View>
      </Card>
      <ResultDisplay label="Resulting weight" value={out ? `${out.newWeight.toFixed(2)} g` : '—'} sub={out ? `Alloy to add: ${out.alloyAdded.toFixed(2)} g` : undefined} />
    </View>
  );
}

// ---------- Gold Weight Arithmetic ----------
export function GoldWeightArithmeticCalculator() {
  const [g, setG] = useState('0');
  const [m, setM] = useState('0');
  const [r, setR] = useState('0');
  const [tola, setTola] = useState('0');
  const [oz, setOz] = useState('0');

  const total = useMemo(() => {
    const grams = parseFloat(g) + parseFloat(m) / 1000 + parseFloat(r) / 1000;
    const fromTola = parseFloat(tola) * GRAM_PER_TOLA;
    const fromOz = parseFloat(oz) * GRAM_PER_TROY_OZ;
    const sum = (grams || 0) + (isFinite(fromTola) ? fromTola : 0) + (isFinite(fromOz) ? fromOz : 0);
    return isFinite(sum) ? sum : null;
  }, [g, m, r, tola, oz]);

  return (
    <View className="gap-3">
      <Card>
        <Text variant="bodyStrong">Add up several weights</Text>
        <View className="gap-3 mt-3">
          <Input label="Grams" value={g} onChangeText={setG} keyboardType="decimal-pad" />
          <Input label="Milligrams" value={m} onChangeText={setM} keyboardType="decimal-pad" />
          <Input label="Ratti (≈ 1/8 g)" value={r} onChangeText={setR} keyboardType="decimal-pad" />
          <Input label="Tola (11.6638 g)" value={tola} onChangeText={setTola} keyboardType="decimal-pad" />
          <Input label="Troy ounces" value={oz} onChangeText={setOz} keyboardType="decimal-pad" />
        </View>
      </Card>
      <ResultDisplay
        label="Total weight"
        value={total === null ? '—' : `${total.toFixed(3)} g`}
        sub={total === null ? undefined : `${(total / GRAM_PER_TOLA).toFixed(3)} tola · ${(total / GRAM_PER_TROY_OZ).toFixed(4)} oz`}
      />
    </View>
  );
}

// ---------- Gold/Silver Unit Converter ----------
export function GoldSilverUnitConverter() {
  const units = [
    { label: 'Grams (g)', value: 'g',    toGram: 1 },
    { label: 'Milligrams (mg)', value: 'mg', toGram: 0.001 },
    { label: 'Tola',     value: 'tola', toGram: GRAM_PER_TOLA },
    { label: 'Troy ounce (oz t)', value: 'ozt', toGram: GRAM_PER_TROY_OZ },
    { label: 'Ratti', value: 'ratti', toGram: 0.121 },
    { label: 'Masha', value: 'masha', toGram: 0.972 },
    { label: 'Bhori', value: 'bhori', toGram: 11.6638 },
    { label: 'Vori (Bangladesh)', value: 'vori', toGram: 11.6638 },
  ];
  const [from, setFrom] = useState('g');
  const [to, setTo] = useState('tola');
  const [v, setV] = useState('100');
  const out = useMemo(() => {
    const a = units.find((u) => u.value === from);
    const b = units.find((u) => u.value === to);
    const x = parseFloat(v);
    if (!a || !b || !isFinite(x)) return null;
    return (x * a.toGram) / b.toGram;
  }, [v, from, to]);
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Value" value={v} onChangeText={setV} keyboardType="decimal-pad" />
          <Picker label="From" value={from} onChange={setFrom} options={units} />
          <Picker label="To" value={to} onChange={setTo} options={units} />
        </View>
      </Card>
      <ResultDisplay label="Converted" value={out === null ? '—' : `${out.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${to}`} />
    </View>
  );
}

// ---------- Gold Rate Finder (city-level static estimates) ----------
export function GoldRateFinder() {
  // Static estimated FX rates only; user supplies USD spot.
  const cities = [
    { label: 'Karachi · PKR', value: 'KHI', fx: 278, currency: 'PKR' },
    { label: 'Lahore · PKR', value: 'LHE', fx: 278, currency: 'PKR' },
    { label: 'Dubai · AED', value: 'DXB', fx: 3.67, currency: 'AED' },
    { label: 'Riyadh · SAR', value: 'RUH', fx: 3.75, currency: 'SAR' },
    { label: 'Mumbai · INR', value: 'BOM', fx: 83, currency: 'INR' },
    { label: 'London · GBP', value: 'LHR', fx: 0.79, currency: 'GBP' },
    { label: 'New York · USD', value: 'NYC', fx: 1, currency: 'USD' },
  ];
  const [city, setCity] = useState('KHI');
  const [usd, setUsd] = useState('2300');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function spot() {
    setLoading(true); setError(null);
    try {
      const d = await fetchGoldSilver();
      setUsd(d.gold.price.toFixed(2));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { spot(); }, []);

  const c = cities.find((x) => x.value === city)!;
  const usdNum = parseFloat(usd);
  const localPerOz = isFinite(usdNum) ? usdNum * c.fx : null;
  const local24Gram = localPerOz === null ? null : localPerOz / GRAM_PER_TROY_OZ;
  const local22Gram = local24Gram === null ? null : local24Gram * 0.916;
  const local22Tola = local22Gram === null ? null : local22Gram * GRAM_PER_TOLA;

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Picker label="City" value={city} onChange={setCity} options={cities} />
          <Input label="Spot USD/oz" value={usd} onChangeText={setUsd} keyboardType="decimal-pad" />
          <Button title={loading ? 'Refreshing…' : 'Use live spot price'} icon="refresh" onPress={spot} variant="secondary" size="sm" />
          {error ? <Text variant="small" tone="danger">{error}</Text> : null}
        </View>
      </Card>
      <ResultDisplay
        label={`24K · per gram · ${c.currency}`}
        value={local24Gram === null ? '—' : fmt(local24Gram)}
      />
      <ResultDisplay emphasize={false} label={`22K · per gram`} value={local22Gram === null ? '—' : fmt(local22Gram)} />
      <ResultDisplay emphasize={false} label={`22K · per tola`} value={local22Tola === null ? '—' : fmt(local22Tola)} />
    </View>
  );
}
