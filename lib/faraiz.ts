/**
 * Faraiz — Islamic inheritance (Mirath) calculator.
 *
 * Implements standard Sunni rules of fixed shares (furud) and residue (asaba)
 * per Quran (Surah An-Nisa 11–12, 176) and classical fiqh.
 *
 * Scope:
 *   - Sunni rules only (not Shi'a Ja'fari, which differ).
 *   - First-degree heirs only: spouse, children, parents, siblings (Kalalah).
 *   - Does not handle: orphaned grandchildren, paternal/maternal grandparents,
 *     full vs consanguine vs uterine sibling distinctions, or full Awl/Radd.
 *   - Educational only — consult a qualified Mufti for actual estate distribution.
 */

export type Gender = 'male' | 'female';
export type SpouseStatus =
  | 'married'
  | 'iddah-revocable'
  | 'iddah-widow'
  | 'divorced-final'
  | 'none';

export type FaraizInputs = {
  estate: number;
  deceasedGender: Gender;
  spouseStatus: SpouseStatus;
  wivesCount: number;
  sons: number;
  daughters: number;
  fatherAlive: boolean;
  motherAlive: boolean;
  fullBrothers: number;
  fullSisters: number;
};

export type Heir = {
  key: string;
  label: string;
  shareLabel: string;
  fraction: number;
  amount: number;
  reason: string;
};

export type FaraizResult = {
  heirs: Heir[];
  totalDistributed: number;
  remainder: number;
  notes: string[];
};

function spouseInherits(s: SpouseStatus): boolean {
  return s === 'married' || s === 'iddah-revocable' || s === 'iddah-widow';
}

export function calculateFaraiz(inputs: FaraizInputs): FaraizResult {
  const notes: string[] = [];
  const heirs: Heir[] = [];
  const E = Math.max(0, inputs.estate);

  const hasChildren = inputs.sons > 0 || inputs.daughters > 0;
  const hasMultipleSiblings = inputs.fullBrothers + inputs.fullSisters >= 2;

  // 1. Spouse
  let spouseFraction = 0;
  if (spouseInherits(inputs.spouseStatus)) {
    if (inputs.deceasedGender === 'male') {
      const wives = Math.max(1, Math.min(4, inputs.wivesCount));
      spouseFraction = hasChildren ? 1 / 8 : 1 / 4;
      const each = spouseFraction / wives;
      heirs.push({
        key: 'wife',
        label: wives === 1 ? 'Wife' : `Wife × ${wives}`,
        shareLabel: hasChildren ? '1/8 (with children)' : '1/4 (no children)',
        fraction: spouseFraction,
        amount: spouseFraction * E,
        reason: `Quran 4:12 — wife receives ${hasChildren ? '1/8' : '1/4'}${
          wives > 1 ? ` divided equally between ${wives} wives (${(each * 100).toFixed(2)}% each)` : ''
        }.`,
      });
    } else {
      spouseFraction = hasChildren ? 1 / 4 : 1 / 2;
      heirs.push({
        key: 'husband',
        label: 'Husband',
        shareLabel: hasChildren ? '1/4 (with children)' : '1/2 (no children)',
        fraction: spouseFraction,
        amount: spouseFraction * E,
        reason: `Quran 4:12 — husband receives ${hasChildren ? '1/4' : '1/2'} of the estate.`,
      });
    }
  } else if (inputs.spouseStatus === 'divorced-final') {
    notes.push('Spouse divorced (final / iddah expired) — does not inherit.');
  }

  // 2. Mother
  let motherFraction = 0;
  if (inputs.motherAlive) {
    motherFraction = hasChildren || hasMultipleSiblings ? 1 / 6 : 1 / 3;
    heirs.push({
      key: 'mother',
      label: 'Mother',
      shareLabel: motherFraction === 1 / 6 ? '1/6' : '1/3',
      fraction: motherFraction,
      amount: motherFraction * E,
      reason:
        motherFraction === 1 / 6
          ? 'Quran 4:11 — mother receives 1/6 when deceased has children or two-or-more siblings.'
          : 'Quran 4:11 — mother receives 1/3 when no children and fewer than two siblings.',
    });
  }

  // 3. Father
  let fatherFraction = 0;
  let fatherTakesResidue = false;
  if (inputs.fatherAlive) {
    if (inputs.sons > 0) {
      fatherFraction = 1 / 6;
      heirs.push({
        key: 'father',
        label: 'Father',
        shareLabel: '1/6 (fixed)',
        fraction: fatherFraction,
        amount: fatherFraction * E,
        reason: 'Quran 4:11 — father receives a fixed 1/6 share when sons survive.',
      });
    } else if (inputs.daughters > 0) {
      fatherFraction = 1 / 6;
      fatherTakesResidue = true;
    } else {
      fatherTakesResidue = true;
    }
  }

  // 4. Daughters (no sons)
  let daughtersFraction = 0;
  if (inputs.sons === 0 && inputs.daughters > 0) {
    if (inputs.daughters === 1) {
      daughtersFraction = 1 / 2;
      heirs.push({
        key: 'daughter',
        label: 'Daughter (1)',
        shareLabel: '1/2',
        fraction: 1 / 2,
        amount: (1 / 2) * E,
        reason: 'Quran 4:11 — a single daughter (no son) receives 1/2.',
      });
    } else {
      daughtersFraction = 2 / 3;
      const each = 2 / 3 / inputs.daughters;
      heirs.push({
        key: 'daughters',
        label: `Daughters × ${inputs.daughters}`,
        shareLabel: '2/3 collectively',
        fraction: 2 / 3,
        amount: (2 / 3) * E,
        reason: `Quran 4:11 — two or more daughters (no son) share 2/3 (${(each * 100).toFixed(2)}% each).`,
      });
    }
  }

  // 5. Residue
  const fixedSum = spouseFraction + motherFraction + fatherFraction + daughtersFraction;
  let residue = Math.max(0, 1 - fixedSum);

  if (inputs.sons > 0) {
    const totalShares = 2 * inputs.sons + inputs.daughters;
    if (totalShares > 0) {
      const sonFraction = (residue * 2) / totalShares;
      const daughterFraction = residue / totalShares;
      heirs.push({
        key: 'sons',
        label: inputs.sons === 1 ? 'Son' : `Sons × ${inputs.sons}`,
        shareLabel: 'Residue (asaba) — 2 shares each',
        fraction: sonFraction * inputs.sons,
        amount: sonFraction * inputs.sons * E,
        reason: `Quran 4:11 — sons take residue after fixed shares; each son = 2× a daughter's share. Each son: ${(sonFraction * 100).toFixed(2)}%.`,
      });
      if (inputs.daughters > 0) {
        heirs.push({
          key: 'daughters-with-sons',
          label: inputs.daughters === 1 ? 'Daughter' : `Daughters × ${inputs.daughters}`,
          shareLabel: 'Residue (asaba) — 1 share each',
          fraction: daughterFraction * inputs.daughters,
          amount: daughterFraction * inputs.daughters * E,
          reason: `Quran 4:11 — daughters share residue with sons in 1:2. Each daughter: ${(daughterFraction * 100).toFixed(2)}%.`,
        });
      }
      residue = 0;
    }
  } else if (fatherTakesResidue) {
    if (fatherFraction > 0) {
      heirs.push({
        key: 'father-residue',
        label: 'Father (residue)',
        shareLabel: 'Asaba (residue)',
        fraction: residue,
        amount: residue * E,
        reason: 'Father takes residue (asaba) in addition to his 1/6 fixed share when daughters survive.',
      });
    } else {
      heirs.push({
        key: 'father',
        label: 'Father',
        shareLabel: 'Asaba (residue)',
        fraction: residue,
        amount: residue * E,
        reason: 'Father is the closest male relative — takes entire residue when no children survive.',
      });
    }
    residue = 0;
  } else if (!hasChildren && !inputs.fatherAlive) {
    const totalSiblingShares = 2 * inputs.fullBrothers + inputs.fullSisters;
    if (totalSiblingShares > 0 && residue > 0) {
      const brotherShare = (residue * 2) / totalSiblingShares;
      const sisterShare = residue / totalSiblingShares;
      if (inputs.fullBrothers > 0) {
        heirs.push({
          key: 'brothers',
          label: inputs.fullBrothers === 1 ? 'Brother' : `Brothers × ${inputs.fullBrothers}`,
          shareLabel: 'Residue (Kalalah, 2:1)',
          fraction: brotherShare * inputs.fullBrothers,
          amount: brotherShare * inputs.fullBrothers * E,
          reason: `Quran 4:176 — Kalalah: brothers take 2 shares per sister's 1. Each brother: ${(brotherShare * 100).toFixed(2)}%.`,
        });
      }
      if (inputs.fullSisters > 0) {
        heirs.push({
          key: 'sisters',
          label: inputs.fullSisters === 1 ? 'Sister' : `Sisters × ${inputs.fullSisters}`,
          shareLabel: 'Residue (Kalalah, 2:1)',
          fraction: sisterShare * inputs.fullSisters,
          amount: sisterShare * inputs.fullSisters * E,
          reason: `Quran 4:176 — Kalalah: sisters share residue 1:2 with brothers. Each sister: ${(sisterShare * 100).toFixed(2)}%.`,
        });
      }
      residue = 0;
    } else if (inputs.fullSisters > 0) {
      const fraction = inputs.fullSisters === 1 ? 1 / 2 : 2 / 3;
      const each = fraction / inputs.fullSisters;
      heirs.push({
        key: 'sisters-alone',
        label: inputs.fullSisters === 1 ? 'Sister (no brother)' : `Sisters × ${inputs.fullSisters} (no brother)`,
        shareLabel: inputs.fullSisters === 1 ? '1/2' : '2/3 collectively',
        fraction,
        amount: fraction * E,
        reason: `Quran 4:176 — ${inputs.fullSisters === 1 ? 'lone sister receives 1/2' : `${inputs.fullSisters}+ sisters share 2/3 (${(each * 100).toFixed(2)}% each)`}.`,
      });
      residue = Math.max(0, residue - fraction);
    }
  }

  const totalDistributed = heirs.reduce((s, h) => s + h.fraction, 0);
  const remainder = Math.max(0, 1 - totalDistributed);

  if (totalDistributed > 1.0001) {
    notes.push(`Total exceeds estate (${(totalDistributed * 100).toFixed(2)}%) — classical fiqh applies "Awl" (proportional reduction).`);
  }
  if (totalDistributed < 0.9999 && remainder > 0) {
    if (heirs.length === 0) {
      notes.push('No eligible heirs — estate goes to Bayt al-Mal per classical fiqh.');
    } else if (
      !inputs.fatherAlive &&
      inputs.sons === 0 &&
      inputs.fullBrothers === 0 &&
      inputs.fullSisters === 0 &&
      remainder > 0.001
    ) {
      notes.push(`Residue of ${(remainder * 100).toFixed(2)}% — classical fiqh applies "Radd" (proportional return to non-spouse heirs).`);
    }
  }

  return { heirs, totalDistributed, remainder, notes };
}
