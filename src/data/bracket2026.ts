/**
 * FIFA World Cup 2026 knockout bracket structure.
 * Source: https://worldcup26.ir/get/games (match IDs 73–104)
 */

/** R32 match index (0–15) → home/away slot labels */
export const R32_FIFA_LABELS: { home: string; away: string }[] = [
  { home: 'Runner-up Group A', away: 'Runner-up Group B' },
  { home: 'Winner Group E', away: '3rd Group A/B/C/D/F' },
  { home: 'Winner Group F', away: 'Runner-up Group C' },
  { home: 'Winner Group C', away: 'Runner-up Group F' },
  { home: 'Winner Group I', away: '3rd Group C/D/F/G/H' },
  { home: 'Runner-up Group E', away: 'Runner-up Group I' },
  { home: 'Winner Group A', away: '3rd Group C/E/F/H/I' },
  { home: 'Winner Group L', away: '3rd Group E/H/I/J/K' },
  { home: 'Winner Group D', away: '3rd Group B/E/F/I/J' },
  { home: 'Winner Group G', away: '3rd Group A/E/H/I/J' },
  { home: 'Runner-up Group K', away: 'Runner-up Group L' },
  { home: 'Winner Group H', away: 'Runner-up Group J' },
  { home: 'Winner Group B', away: '3rd Group E/F/G/I/J' },
  { home: 'Winner Group J', away: 'Runner-up Group H' },
  { home: 'Winner Group K', away: '3rd Group D/E/I/J/L' },
  { home: 'Runner-up Group D', away: 'Runner-up Group G' },
];

/**
 * Outer-ring slot order (32 positions, indices 0–31).
 * Even index = home, odd = away for each R32 match.
 * Representative teams for simulation (group winners/runners-up + best 3rd).
 */
export const R32_SLOT_TEAM_IDS: string[] = [
  'kr', 'ca', // M73: 2A vs 2B
  'de', 'za', // M74: 1E vs 3rd
  'nl', 'ma', // M75: 1F vs 2C
  'br', 'jp', // M76: 1C vs 2F
  'fr', 'ht', // M77
  'ec', 'no', // M78: 2E vs 2I
  'mx', 'ci', // M79: 1A vs 3rd
  'gb-eng', 'sn', // M80: 1L vs 3rd
  'us', 'cw', // M81: 1D vs 3rd
  'be', 'nz', // M82: 1G vs 3rd
  'co', 'hr', // M83: 2K vs 2L
  'es', 'at', // M84: 1H vs 2J
  'ch', 'tn', // M85: 1B vs 3rd
  'ar', 'uy', // M86: 1J vs 2H
  'pt', 'gh', // M87: 1K vs 3rd
  'au', 'ir', // M88: 2D vs 2G
];

/**
 * FIFA chart order on the circular bracket:
 * left half top→bottom, then right half top→bottom (values = R32 match index 0–15).
 * Source: official FIFA WC 2026 knockout bracket poster.
 */
export const FIFA_R32_VISUAL_ORDER: readonly number[] = [
  1, 4, 0, 2, 10, 11, 8, 9, 3, 5, 6, 7, 13, 15, 12, 14,
];

/** R32 match index → visual pair slot (0–15) on the outer ring */
export function getR32VisualPairSlot(r32MatchIndex: number): number {
  const slot = FIFA_R32_VISUAL_ORDER.indexOf(r32MatchIndex);
  return slot >= 0 ? slot : r32MatchIndex;
}

/** R16 match index → feeder R32 match indices [team1, team2] */
export const R16_FEEDER_R32: ReadonlyArray<readonly [number, number]> = [
  [1, 4], // M89: W74 vs W77
  [0, 2], // M90: W73 vs W75
  [3, 5], // M91: W76 vs W78
  [6, 7], // M92: W79 vs W80
  [10, 11], // M93: W83 vs W84
  [8, 9], // M94: W81 vs W82
  [13, 15], // M95: W86 vs W88
  [12, 14], // M96: W85 vs W87
];

/** QF match index → feeder R16 match indices (FIFA crossover) */
export const QF_FEEDER_R16: ReadonlyArray<readonly [number, number]> = [
  [0, 1], // M97: W89 vs W90
  [4, 5], // M98: W93 vs W94
  [2, 3], // M99: W91 vs W92
  [6, 7], // M100: W95 vs W96
];

/** SF match index → feeder QF match indices (API: M101 = W97+W98, M102 = W99+W100) */
export const SF_FEEDER_QF: ReadonlyArray<readonly [number, number]> = [
  [0, 1], // M101: W97 vs W98
  [2, 3], // M102: W99 vs W100
];

/** R32 match index → R16 match index + slot (FIFA crossover, not binary tree) */
const R32_TO_R16: { r16: number; slot: 1 | 2 }[] = [
  { r16: 1, slot: 1 }, // M73 → R16-90
  { r16: 0, slot: 1 }, // M74 → R16-89
  { r16: 1, slot: 2 }, // M75
  { r16: 2, slot: 1 }, // M76
  { r16: 0, slot: 2 }, // M77
  { r16: 2, slot: 2 }, // M78
  { r16: 3, slot: 1 }, // M79
  { r16: 3, slot: 2 }, // M80
  { r16: 5, slot: 1 }, // M81 → R16-94
  { r16: 5, slot: 2 }, // M82
  { r16: 4, slot: 1 }, // M83 → R16-93
  { r16: 4, slot: 2 }, // M84
  { r16: 7, slot: 1 }, // M85 → R16-96
  { r16: 6, slot: 1 }, // M86 → R16-95
  { r16: 7, slot: 2 }, // M87
  { r16: 6, slot: 2 }, // M88
];

/** R16 match index → QF match + slot (FIFA crossover, not binary tree) */
const R16_TO_QF: { qf: number; slot: 1 | 2 }[] = [
  { qf: 0, slot: 1 }, // M89 → M97
  { qf: 0, slot: 2 }, // M90
  { qf: 2, slot: 1 }, // M91 → M99
  { qf: 2, slot: 2 }, // M92
  { qf: 1, slot: 1 }, // M93 → M98
  { qf: 1, slot: 2 }, // M94
  { qf: 3, slot: 1 }, // M95 → M100
  { qf: 3, slot: 2 }, // M96
];

/** QF match index → SF match + slot (API: M97/M98 → M101, M99/M100 → M102) */
const QF_TO_SF: { sf: number; slot: 1 | 2 }[] = [
  { sf: 0, slot: 1 }, // M97 → M101 home
  { sf: 0, slot: 2 }, // M98 → M101 away
  { sf: 1, slot: 1 }, // M99 → M102 home
  { sf: 1, slot: 2 }, // M100 → M102 away
];

export interface BracketAdvanceTarget {
  nextRound: number;
  nextIndex: number;
  slot: 1 | 2;
}

export function getBracketAdvanceTarget(
  round: number,
  index: number,
): BracketAdvanceTarget | null {
  if (round >= 4) return null;

  if (round === 0) {
    const m = R32_TO_R16[index];
    if (!m) return null;
    return { nextRound: 1, nextIndex: m.r16, slot: m.slot };
  }

  if (round === 1) {
    const m = R16_TO_QF[index];
    if (!m) return null;
    return { nextRound: 2, nextIndex: m.qf, slot: m.slot };
  }

  if (round === 2) {
    const m = QF_TO_SF[index];
    if (!m) return null;
    return { nextRound: 3, nextIndex: m.sf, slot: m.slot };
  }

  if (round === 3) {
    return {
      nextRound: 4,
      nextIndex: 0,
      slot: index % 2 === 0 ? 1 : 2,
    };
  }

  return null;
}

export function getNextMatchId(
  round: number,
  index: number,
): { targetMatchId: string; position: 1 | 2 } | null {
  const t = getBracketAdvanceTarget(round, index);
  if (!t) return null;

  const prefix =
    t.nextRound === 1
      ? 'r16'
      : t.nextRound === 2
        ? 'qf'
        : t.nextRound === 3
          ? 'sf'
          : 'final';

  return { targetMatchId: `${prefix}-${t.nextIndex}`, position: t.slot };
}
