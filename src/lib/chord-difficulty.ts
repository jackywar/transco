/**
 * Chord Difficulty Scoring Module
 *
 * Calculates a difficulty score (0-100) for guitar chord shapes
 * based on fingering characteristics.
 */

export interface CanonicalChord {
  name: string;
  frets: number[]; // -1 muted, 0 open, >0 fretted
  fingers?: number[]; // 1-4 for fingers, 0 for unused
}

export interface DifficultyBreakdown {
  barre: number;
  fretSpan: number;
  stringSpan: number;
  fingerCount: number;
  fingerStretch: number;
  crowding: number;
  gaps: number;
  openStringBonus: number;
  total: number;
}

export interface DifficultyResult {
  score: number;
  breakdown: DifficultyBreakdown;
}

/**
 * Centralized weights for difficulty calculation.
 * All values are multipliers that affect the final 0-100 score.
 */
export const DIFFICULTY_WEIGHTS = {
  /** Base penalty for barre chords (finger across multiple strings) */
  barre: 25,

  /** Penalty per fret of span (max - min fretted positions) */
  fretSpanPerFret: 8,

  /** Penalty for strings not played (muted in the middle) */
  stringSpanPenalty: 5,

  /** Penalty per finger used */
  fingerCountBase: 4,

  /** Penalty for stretch between fingers on same fret */
  fingerStretchPerString: 6,

  /** Penalty for multiple fingers crowded on adjacent frets */
  crowdingPerInstance: 4,

  /** Penalty for gaps (unfretted strings between fretted ones) */
  gapsPerHole: 6,

  /** Bonus (negative penalty) for each open string played */
  openStringBonus: -4,

  /** Minimum score floor */
  minScore: 0,

  /** Maximum score ceiling */
  maxScore: 100,
} as const;

/**
 * Detects if the chord shape uses a barre (one finger across multiple strings)
 */
function detectBarre(frets: number[], fingers?: number[]): boolean {
  if (fingers) {
    const fingerCounts = new Map<number, number>();
    fingers.forEach((f, i) => {
      if (f > 0 && frets[i] > 0) {
        fingerCounts.set(f, (fingerCounts.get(f) || 0) + 1);
      }
    });
    return Array.from(fingerCounts.values()).some((count) => count >= 2);
  }

  // Fallback: check if same fret appears multiple times at low positions
  const frettedPositions = frets.filter((f) => f > 0);
  if (frettedPositions.length === 0) return false;

  const minFret = Math.min(...frettedPositions);
  const countAtMin = frettedPositions.filter((f) => f === minFret).length;
  return countAtMin >= 2 && minFret <= 5;
}

/**
 * Calculates the fret span (distance between lowest and highest fretted positions)
 */
function calculateFretSpan(frets: number[]): number {
  const fretted = frets.filter((f) => f > 0);
  if (fretted.length <= 1) return 0;
  return Math.max(...fretted) - Math.min(...fretted);
}

/**
 * Calculates string span penalty for muted strings in the middle
 */
function calculateStringSpan(frets: number[]): number {
  const playedIndices = frets
    .map((f, i) => (f >= 0 ? i : -1))
    .filter((i) => i >= 0);
  if (playedIndices.length <= 1) return 0;

  const first = Math.min(...playedIndices);
  const last = Math.max(...playedIndices);
  let mutedInMiddle = 0;

  for (let i = first + 1; i < last; i++) {
    if (frets[i] === -1) mutedInMiddle++;
  }

  return mutedInMiddle;
}

/**
 * Counts the number of fingers used
 */
function countFingers(frets: number[], fingers?: number[]): number {
  if (fingers) {
    const uniqueFingers = new Set(fingers.filter((f) => f > 0));
    return uniqueFingers.size;
  }

  // Fallback: count fretted positions (excluding potential barre)
  const fretted = frets.filter((f) => f > 0);
  const fretCounts = new Map<number, number>();
  fretted.forEach((f) => fretCounts.set(f, (fretCounts.get(f) || 0) + 1));

  let fingerEstimate = 0;
  fretCounts.forEach((count, _fret) => {
    // If multiple strings on same fret, likely a barre (counts as 1)
    fingerEstimate += count >= 2 ? 1 : count;
  });

  return Math.min(fingerEstimate, 4);
}

/**
 * Calculates stretch penalty (fingers spread across non-adjacent strings on same fret)
 */
function calculateFingerStretch(frets: number[], fingers?: number[]): number {
  if (!fingers) {
    // Fallback: estimate based on fret positions
    const fretted = frets.map((f, i) => ({ fret: f, string: i })).filter((x) => x.fret > 0);
    const byFret = new Map<number, number[]>();
    fretted.forEach(({ fret, string }) => {
      if (!byFret.has(fret)) byFret.set(fret, []);
      byFret.get(fret)!.push(string);
    });

    let stretch = 0;
    byFret.forEach((strings) => {
      if (strings.length >= 2) {
        strings.sort((a, b) => a - b);
        for (let i = 1; i < strings.length; i++) {
          const gap = strings[i] - strings[i - 1] - 1;
          if (gap > 0) stretch += gap;
        }
      }
    });
    return stretch;
  }

  // With fingers: check actual finger positions
  const fingerPositions = new Map<number, number[]>();
  fingers.forEach((f, i) => {
    if (f > 0 && frets[i] > 0) {
      if (!fingerPositions.has(f)) fingerPositions.set(f, []);
      fingerPositions.get(f)!.push(i);
    }
  });

  let stretch = 0;
  fingerPositions.forEach((strings) => {
    if (strings.length >= 2) {
      strings.sort((a, b) => a - b);
      const span = strings[strings.length - 1] - strings[0];
      if (span > 1) stretch += span - 1;
    }
  });

  return stretch;
}

/**
 * Calculates crowding penalty (multiple fingers on adjacent frets)
 */
function calculateCrowding(frets: number[], fingers?: number[]): number {
  const fretted = frets.filter((f) => f > 0);
  if (fretted.length <= 1) return 0;

  const sortedFrets = [...fretted].sort((a, b) => a - b);
  let crowding = 0;

  for (let i = 1; i < sortedFrets.length; i++) {
    if (sortedFrets[i] - sortedFrets[i - 1] === 1) {
      crowding++;
    }
  }

  return crowding;
}

/**
 * Counts gaps (unfretted strings between fretted ones, excluding muted)
 */
function calculateGaps(frets: number[]): number {
  const positions = frets.map((f, i) => ({ fret: f, string: i }));
  const fretted = positions.filter((p) => p.fret > 0);
  if (fretted.length <= 1) return 0;

  const firstFretted = Math.min(...fretted.map((p) => p.string));
  const lastFretted = Math.max(...fretted.map((p) => p.string));

  let gaps = 0;
  for (let i = firstFretted + 1; i < lastFretted; i++) {
    if (frets[i] === 0) gaps++; // Open string in the middle counts as a gap
  }

  return gaps;
}

/**
 * Counts open strings played
 */
function countOpenStrings(frets: number[]): number {
  return frets.filter((f) => f === 0).length;
}

/**
 * Main difficulty calculation function
 */
export function calculateDifficulty(chord: CanonicalChord): DifficultyResult {
  const { frets, fingers } = chord;
  const w = DIFFICULTY_WEIGHTS;

  const hasBarre = detectBarre(frets, fingers);
  const fretSpan = calculateFretSpan(frets);
  const stringSpan = calculateStringSpan(frets);
  const fingerCount = countFingers(frets, fingers);
  const fingerStretch = calculateFingerStretch(frets, fingers);
  const crowding = calculateCrowding(frets, fingers);
  const gaps = calculateGaps(frets);
  const openStrings = countOpenStrings(frets);

  const breakdown: DifficultyBreakdown = {
    barre: hasBarre ? w.barre : 0,
    fretSpan: fretSpan * w.fretSpanPerFret,
    stringSpan: stringSpan * w.stringSpanPenalty,
    fingerCount: fingerCount * w.fingerCountBase,
    fingerStretch: fingerStretch * w.fingerStretchPerString,
    crowding: crowding * w.crowdingPerInstance,
    gaps: gaps * w.gapsPerHole,
    openStringBonus: openStrings * w.openStringBonus,
    total: 0,
  };

  const rawScore =
    breakdown.barre +
    breakdown.fretSpan +
    breakdown.stringSpan +
    breakdown.fingerCount +
    breakdown.fingerStretch +
    breakdown.crowding +
    breakdown.gaps +
    breakdown.openStringBonus;

  breakdown.total = Math.max(w.minScore, Math.min(w.maxScore, rawScore));

  return {
    score: breakdown.total,
    breakdown,
  };
}

/**
 * Converts a difficulty score (0-100) to a color using HSL interpolation.
 * Green (120°) for easy -> Yellow (60°) for medium -> Red (0°) for hard
 */
export function difficultyToColor(score: number, alpha: number = 1): string {
  const clampedScore = Math.max(0, Math.min(100, score));
  // Map 0-100 to 120-0 (green to red in HSL hue)
  const hue = 120 - (clampedScore / 100) * 120;
  // Saturation: keep vibrant
  const saturation = 70;
  // Lightness: slightly lighter for better readability
  const lightness = 45;

  if (alpha < 1) {
    return `hsla(${Math.round(hue)}, ${saturation}%, ${lightness}%, ${alpha})`;
  }
  return `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
}

/**
 * Returns a light background color variant for UI backgrounds
 */
export function difficultyToBackgroundColor(score: number): string {
  const clampedScore = Math.max(0, Math.min(100, score));
  const hue = 120 - (clampedScore / 100) * 120;
  return `hsl(${Math.round(hue)}, 60%, 95%)`;
}

/**
 * Returns a border color variant
 */
export function difficultyToBorderColor(score: number): string {
  const clampedScore = Math.max(0, Math.min(100, score));
  const hue = 120 - (clampedScore / 100) * 120;
  return `hsl(${Math.round(hue)}, 70%, 50%)`;
}

/**
 * Returns a text label for difficulty ranges
 */
export function difficultyToLabel(score: number): string {
  if (score < 20) return "Très facile";
  if (score < 40) return "Facile";
  if (score < 60) return "Moyen";
  if (score < 80) return "Difficile";
  return "Très difficile";
}

/**
 * Formats the breakdown for debug display
 */
export function formatBreakdown(breakdown: DifficultyBreakdown): string {
  const lines: string[] = [];

  if (breakdown.barre !== 0) lines.push(`Barré: +${breakdown.barre}`);
  if (breakdown.fretSpan !== 0) lines.push(`Étendue frettes: +${breakdown.fretSpan}`);
  if (breakdown.stringSpan !== 0) lines.push(`Étendue cordes: +${breakdown.stringSpan}`);
  if (breakdown.fingerCount !== 0) lines.push(`Nb doigts: +${breakdown.fingerCount}`);
  if (breakdown.fingerStretch !== 0) lines.push(`Écarts doigts: +${breakdown.fingerStretch}`);
  if (breakdown.crowding !== 0) lines.push(`Encombrement: +${breakdown.crowding}`);
  if (breakdown.gaps !== 0) lines.push(`Trous: +${breakdown.gaps}`);
  if (breakdown.openStringBonus !== 0) lines.push(`Cordes à vide: ${breakdown.openStringBonus}`);

  lines.push(`Total: ${breakdown.total}`);

  return lines.join("\n");
}
