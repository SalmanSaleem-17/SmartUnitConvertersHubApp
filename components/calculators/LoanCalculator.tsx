import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { ResultDisplay } from '@/components/ui/ResultDisplay';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

// ───────── EMI math ─────────
function computeEmi(principal: number, annualRate: number, years: number) {
  if (principal <= 0 || years <= 0) return 0;
  if (annualRate === 0) return principal / (years * 12);
  const r = annualRate / 100 / 12;
  const n = years * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// Tiered (phased) amortization — EMI re-computed at the start of each phase
function computeTieredSchedule(principal: number, phases: { years: number; rate: number }[]) {
  const phaseResults: { years: number; rate: number; emi: number; interest: number; principal: number }[] = [];
  const yearly: { year: number; balance: number; principal: number; interest: number }[] = [];

  const totalMonths = phases.reduce((s, p) => s + Math.round(p.years * 12), 0);
  if (principal <= 0 || totalMonths === 0) {
    return { phaseResults, yearly, totalInterest: 0, totalPayable: 0, startingEmi: 0, endingEmi: 0 };
  }

  let balance = principal;
  let elapsed = 0;
  let yPrin = 0, yInt = 0;
  let totalInterest = 0;
  let totalPayable = 0;

  for (const phase of phases) {
    const phaseMonths = Math.round(phase.years * 12);
    if (phaseMonths === 0) continue;
    const monthlyRate = phase.rate / 100 / 12;
    const remainingMonths = totalMonths - elapsed;
    const emi = computeEmi(balance, phase.rate, remainingMonths / 12);
    let phaseInterest = 0, phasePrincipal = 0;

    for (let m = 0; m < phaseMonths; m++) {
      const interest = balance * monthlyRate;
      const prin = Math.min(emi - interest, balance);
      balance -= prin;
      phaseInterest += interest;
      phasePrincipal += prin;
      yInt += interest;
      yPrin += prin;
      elapsed++;
      totalPayable += prin + interest;
      if (elapsed % 12 === 0 || elapsed === totalMonths) {
        yearly.push({ year: Math.ceil(elapsed / 12), balance: Math.max(0, Math.round(balance)), principal: Math.round(yPrin), interest: Math.round(yInt) });
        yPrin = 0; yInt = 0;
      }
    }
    totalInterest += phaseInterest;
    phaseResults.push({ years: phase.years, rate: phase.rate, emi, interest: phaseInterest, principal: phasePrincipal });
  }

  return {
    phaseResults, yearly, totalInterest, totalPayable,
    startingEmi: phaseResults[0]?.emi ?? 0,
    endingEmi: phaseResults[phaseResults.length - 1]?.emi ?? 0,
  };
}

type Phase = { id: number; years: string; rate: string };
type Scenario = { id: number; phases: Phase[] };

const SCENARIO_TINTS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// ───────── component ─────────
export function LoanCalculator() {
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? Colors.dark : Colors.light;

  const [amount, setAmount] = useState('500000');
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { id: 1, phases: [{ id: 11, years: '5', rate: '12' }] },
    { id: 2, phases: [{ id: 21, years: '5', rate: '10' }, { id: 22, years: '15', rate: '14' }] },
  ]);

  const principal = parseFloat(amount) || 0;

  const results = useMemo(() => {
    return scenarios.map((s, idx) => {
      const phases = s.phases.map((p) => ({ years: parseFloat(p.years) || 0, rate: parseFloat(p.rate) || 0 }));
      const t = computeTieredSchedule(principal, phases);
      const totalYears = phases.reduce((a, p) => a + p.years, 0);
      const interestRatio = principal > 0 ? t.totalInterest / principal : 0;
      const label = phases.length === 1
        ? `${phases[0].years}y @ ${phases[0].rate}%`
        : phases.map((p) => `${p.years}y@${p.rate}%`).join(' → ');
      return {
        id: s.id, idx, color: SCENARIO_TINTS[idx % SCENARIO_TINTS.length],
        label, isTiered: phases.length > 1, totalYears,
        totalInterest: t.totalInterest, totalPayable: t.totalPayable,
        interestRatio, startingEmi: t.startingEmi, endingEmi: t.endingEmi,
        phases: t.phaseResults, yearly: t.yearly,
      };
    });
  }, [scenarios, principal]);

  const valid = results.filter((r) => r.startingEmi > 0);
  const cheapest = valid.length > 0 ? valid.reduce((a, b) => (a.totalInterest <= b.totalInterest ? a : b)) : null;

  // Scenario CRUD
  const addScenario = () =>
    setScenarios([...scenarios, { id: Date.now(), phases: [{ id: Date.now() + 1, years: '15', rate: '12' }] }]);
  const removeScenario = (id: number) =>
    setScenarios(scenarios.filter((s) => s.id !== id));
  const addPhase = (sId: number) =>
    setScenarios(scenarios.map((s) => s.id === sId ? { ...s, phases: [...s.phases, { id: Date.now(), years: '5', rate: '14' }] } : s));
  const removePhase = (sId: number, pId: number) =>
    setScenarios(scenarios.map((s) => s.id === sId ? { ...s, phases: s.phases.filter((p) => p.id !== pId) } : s));
  const updatePhase = (sId: number, pId: number, field: 'years' | 'rate', val: string) =>
    setScenarios(scenarios.map((s) => s.id === sId
      ? { ...s, phases: s.phases.map((p) => p.id === pId ? { ...p, [field]: val } : p) } : s));

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <View className="gap-3">
      <Card>
        <Input label="Loan amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" icon="cash" />
        <Text variant="caption" tone="muted" className="mt-1.5">
          Compare multiple loan scenarios. Add tiered phases to model step-rate / ARM loans where the rate changes mid-loan.
        </Text>
      </Card>

      {/* Scenarios */}
      {scenarios.map((s, sIdx) => {
        const r = results[sIdx];
        const isCheapest = cheapest?.id === r?.id;
        return (
          <Card key={s.id} className={isCheapest ? 'border-success border-2' : ''}>
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-7 rounded-sm" style={{ backgroundColor: r?.color }} />
              <View className="flex-1">
                <Text variant="bodyStrong">Scenario {sIdx + 1}{r?.isTiered ? ' · Tiered' : ''}</Text>
                <Text variant="caption" tone="muted">{r?.label || '—'}</Text>
              </View>
              {isCheapest ? (
                <View className="px-2 py-0.5 rounded-pill bg-success/15">
                  <Text variant="caption" tone="success">CHEAPEST</Text>
                </View>
              ) : null}
              {scenarios.length > 1 ? (
                <Pressable onPress={() => removeScenario(s.id)} className="w-8 h-8 rounded-md items-center justify-center bg-danger/10 active:opacity-70">
                  <Ionicons name="close" size={16} color={tokens.danger} />
                </Pressable>
              ) : null}
            </View>

            {/* Phases */}
            <View className="gap-2 mt-3">
              {s.phases.map((p, pIdx) => (
                <View key={p.id} className="flex-row gap-2 items-end">
                  <View className="flex-1">
                    <Input label={s.phases.length > 1 ? `Phase ${pIdx + 1} · Years` : 'Years'} value={p.years} onChangeText={(v) => updatePhase(s.id, p.id, 'years', v)} keyboardType="decimal-pad" />
                  </View>
                  <View className="flex-1">
                    <Input label="Rate %" value={p.rate} onChangeText={(v) => updatePhase(s.id, p.id, 'rate', v)} keyboardType="decimal-pad" />
                  </View>
                  {s.phases.length > 1 ? (
                    <Pressable onPress={() => removePhase(s.id, p.id)} className="w-12 h-12 rounded-md items-center justify-center bg-muted dark:bg-muted-dark active:opacity-70">
                      <Ionicons name="close" size={16} color={tokens.danger} />
                    </Pressable>
                  ) : null}
                </View>
              ))}
              <Button title="Add tiered phase" icon="add" size="sm" variant="ghost" onPress={() => addPhase(s.id)} />
            </View>

            {/* Result rows for this scenario */}
            {r && r.startingEmi > 0 ? (
              <View className="mt-3 pt-3 border-t-hairline border-border dark:border-border-dark gap-2">
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text variant="caption" tone="muted">{r.isTiered ? 'STARTING EMI' : 'EMI'}</Text>
                    <Text variant="h3" tone="primary">{fmt(r.startingEmi)}</Text>
                    {r.isTiered ? <Text variant="caption" tone="muted">{`Ends: ${fmt(r.endingEmi)}`}</Text> : null}
                  </View>
                  <View className="flex-1">
                    <Text variant="caption" tone="muted">TOTAL INTEREST</Text>
                    <Text variant="h3" tone="warning">{fmt(r.totalInterest)}</Text>
                    <Text variant="caption" tone="muted">{(r.interestRatio * 100).toFixed(0)}% of principal</Text>
                  </View>
                </View>
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text variant="caption" tone="muted">TOTAL PAYABLE</Text>
                    <Text variant="bodyStrong">{fmt(r.totalPayable)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text variant="caption" tone="muted">TERM</Text>
                    <Text variant="bodyStrong">{r.totalYears} years</Text>
                  </View>
                </View>
                {/* Per-phase summary */}
                {r.phases.length > 1 ? (
                  <View className="gap-1 mt-1">
                    {r.phases.map((p, i) => (
                      <View key={i} className="flex-row items-center">
                        <Text variant="caption" tone="muted" className="flex-1">{`Phase ${i + 1}: ${p.years}y @ ${p.rate}%`}</Text>
                        <Text variant="caption">{fmt(p.emi)}/mo</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}
          </Card>
        );
      })}

      <Button title="Add scenario" icon="add" variant="secondary" fullWidth onPress={addScenario} />

      {/* Comparison summary */}
      {valid.length > 1 && cheapest ? (
        <ResultDisplay
          label="Best scenario"
          value={cheapest.label}
          sub={`Saves ${fmt(Math.max(...valid.map((v) => v.totalInterest)) - cheapest.totalInterest)} vs the most expensive option`}
        />
      ) : valid.length === 1 ? (
        <ResultDisplay label="Total payable" value={fmt(valid[0].totalPayable)} sub={`Interest: ${fmt(valid[0].totalInterest)}`} />
      ) : null}

      {/* Amortization preview for cheapest scenario */}
      {cheapest && cheapest.yearly.length > 0 ? (
        <Card variant="subtle">
          <Text variant="bodyStrong">Amortization · {cheapest.label}</Text>
          <Text variant="caption" tone="muted" className="mt-1">{`Year-end balance + that year's principal & interest paid.`}</Text>
          <View className="mt-2.5">
            <View className="flex-row pb-1.5 border-b-hairline border-border dark:border-border-dark">
              <Text variant="caption" tone="muted" className="w-14">YEAR</Text>
              <Text variant="caption" tone="muted" className="flex-1 text-right">PRINCIPAL</Text>
              <Text variant="caption" tone="muted" className="flex-1 text-right">INTEREST</Text>
              <Text variant="caption" tone="muted" className="flex-1 text-right">BALANCE</Text>
            </View>
            {cheapest.yearly.map((row) => (
              <View key={row.year} className="flex-row py-1.5 border-b-hairline border-border dark:border-border-dark">
                <Text variant="small" className="w-14">Yr {row.year}</Text>
                <Text variant="small" className="flex-1 text-right">{fmt(row.principal)}</Text>
                <Text variant="small" tone="warning" className="flex-1 text-right">{fmt(row.interest)}</Text>
                <Text variant="small" tone="primary" className="flex-1 text-right">{fmt(row.balance)}</Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}
    </View>
  );
}
