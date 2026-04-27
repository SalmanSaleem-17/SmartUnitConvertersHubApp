import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Picker } from '@/components/ui/Picker';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { ResultDisplay } from '@/components/ui/ResultDisplay';
import { fetchSalahTimes, geocodeCity, type SalahTimings, type GeoMatch } from '@/lib/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const ORDER: { key: keyof SalahTimings; label: string; icon: string }[] = [
  { key: 'Fajr',    label: 'Fajr',    icon: '🌅' },
  { key: 'Sunrise', label: 'Sunrise', icon: '☀️' },
  { key: 'Dhuhr',   label: 'Dhuhr',   icon: '🌞' },
  { key: 'Asr',     label: 'Asr',     icon: '🌤' },
  { key: 'Maghrib', label: 'Maghrib', icon: '🌇' },
  { key: 'Isha',    label: 'Isha',    icon: '🌙' },
];

const METHODS: { label: string; value: string }[] = [
  { label: 'University of Islamic Sciences, Karachi', value: '1' },
  { label: 'Islamic Society of North America (ISNA)',  value: '2' },
  { label: 'Muslim World League',                       value: '3' },
  { label: 'Umm Al-Qura, Makkah',                       value: '4' },
  { label: 'Egyptian General Authority of Survey',      value: '5' },
  { label: 'Institute of Geophysics, Tehran',           value: '7' },
  { label: 'Gulf Region',                               value: '8' },
  { label: 'Kuwait',                                    value: '9' },
  { label: 'Qatar',                                     value: '10' },
  { label: 'Singapore',                                 value: '11' },
  { label: 'France',                                    value: '12' },
  { label: 'Turkey',                                    value: '13' },
];

function fmtClock(t: string): string {
  // Aladhan returns "05:23 (PKT)" — strip timezone tag.
  return t.split(' ')[0];
}

function nextPrayerInfo(timings: SalahTimings) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  for (const p of ORDER) {
    const [hh, mm] = fmtClock(timings[p.key]).split(':').map(Number);
    const t = new Date(`${today}T00:00:00`);
    t.setHours(hh, mm, 0, 0);
    if (t > now) {
      const diffMs = t.getTime() - now.getTime();
      const hrs = Math.floor(diffMs / 3600000);
      const mins = Math.floor((diffMs / 60000) % 60);
      return { name: p.label, in: `${hrs}h ${mins}m` };
    }
  }
  return { name: 'Fajr (tomorrow)', in: '—' };
}

export function SalahTimesCalculator() {
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? Colors.dark : Colors.light;
  const [city, setCity] = useState('Karachi');
  const [method, setMethod] = useState('2');
  const [matches, setMatches] = useState<GeoMatch[]>([]);
  const [selected, setSelected] = useState<GeoMatch | null>(null);
  const [timings, setTimings] = useState<SalahTimings | null>(null);
  const [hijri, setHijri] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search() {
    setLoading(true); setError(null);
    try {
      const ms = await geocodeCity(city);
      if (ms.length === 0) {
        setError('City not found.');
        setMatches([]);
        return;
      }
      setMatches(ms);
      await loadTimes(ms[0]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function loadTimes(m: GeoMatch) {
    setSelected(m); setLoading(true); setError(null);
    try {
      const data = await fetchSalahTimes({
        latitude: m.latitude,
        longitude: m.longitude,
        method: parseInt(method),
      });
      setTimings(data.timings);
      setHijri(data.date.hijri.date);
      setDate(data.date.readable);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Auto-load Karachi on mount
  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when method changes
  useEffect(() => {
    if (selected) loadTimes(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method]);

  const next = useMemo(() => (timings ? nextPrayerInfo(timings) : null), [timings]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="City" value={city} onChangeText={setCity} icon="location" autoCapitalize="words" />
          <Picker label="Calculation method" value={method} onChange={setMethod} options={METHODS} />
          <Button title={loading ? 'Loading…' : 'Search city'} icon="search" onPress={search} fullWidth />
          {error ? <Text variant="small" tone="danger">{error}</Text> : null}
          {matches.length > 1 ? (
            <View className="gap-2">
              <Text variant="caption" tone="muted">PICK A MATCH</Text>
              {matches.slice(0, 5).map((m) => (
                <Button
                  key={m.id}
                  title={`${m.name}${m.admin1 ? ', ' + m.admin1 : ''}, ${m.country}`}
                  onPress={() => loadTimes(m)}
                  variant={selected?.id === m.id ? 'primary' : 'secondary'}
                  size="sm"
                />
              ))}
            </View>
          ) : null}
        </View>
      </Card>

      {loading && !timings ? (
        <Card className="items-center py-6">
          <ActivityIndicator color={tokens.primary} />
          <Text variant="small" tone="muted" className="mt-2">
            Fetching prayer times…
          </Text>
        </Card>
      ) : null}

      {timings && selected ? (
        <>
          <ResultDisplay
            label={`Next prayer · ${selected.name}`}
            value={next?.name ?? '—'}
            sub={next ? `In ${next.in} · ${date}` : undefined}
          />
          <Card>
            <Text variant="bodyStrong">{`Today's times`}</Text>
            <Text variant="small" tone="muted">{`Hijri: ${hijri}`}</Text>
            <View className="gap-2 mt-3">
              {ORDER.map((p) => (
                <View
                  key={p.key}
                  className="flex-row items-center px-3 py-3 rounded-md border-hairline border-border dark:border-border-dark"
                >
                  <Text variant="h3" className="w-8">
                    {p.icon}
                  </Text>
                  <Text variant="bodyStrong" className="flex-1">{p.label}</Text>
                  <Text variant="bodyStrong" tone="primary">{fmtClock(timings[p.key])}</Text>
                </View>
              ))}
            </View>
          </Card>
        </>
      ) : null}
    </View>
  );
}
