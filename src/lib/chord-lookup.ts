import {
  convertFrenchChordToEnglish,
  getChordLookupCandidates,
  normalizeInputText,
} from "./chord-notation";
import { getBestChordShape } from "./chord-db";
import {
  calculateDifficulty,
  type DifficultyResult,
  type CanonicalChord,
} from "./chord-difficulty";

export type NormalizedChordDiagram = {
  title: string;
  baseFret: number;
  frets: Array<number | "x" | 0>;
  fingers?: Array<number | null>;
  barres?: Array<{ fromString: number; toString: number; fret: number }>;
  difficulty?: DifficultyResult;
};

export async function lookupChordDiagramFromFrench(
  frenchChord: string,
): Promise<NormalizedChordDiagram[] | null> {
  const normalizedFrench = normalizeInputText(frenchChord);
  const english = convertFrenchChordToEnglish(normalizedFrench);
  if (!english) return null;

  const candidates = getChordLookupCandidates(english);

  if (process.env.NODE_ENV !== "production") {
    console.debug(
      `[chord-lookup] french="${frenchChord}" english="${english}" candidates=[${candidates.join(
        ", ",
      )}]`,
    );
  }

  for (const candidate of candidates) {
    const [mainCandidate] = candidate.split("/");
    const shape = getBestChordShape(mainCandidate);
    if (shape) {
      // Convert to canonical format for difficulty calculation
      const canonicalChord: CanonicalChord = {
        name: english,
        frets: shape.frets,
        fingers: shape.fingers?.map((f) => (f === null ? 0 : f)) as
          | number[]
          | undefined,
      };
      const difficulty = calculateDifficulty(canonicalChord);

      const normalized: NormalizedChordDiagram = {
        title: english,
        baseFret: shape.baseFret,
        frets: shape.frets.map((f) => (f < 0 ? "x" : f)) as Array<
          number | "x" | 0
        >,
        fingers: shape.fingers?.map((f) => (f === 0 ? null : f)) ?? undefined,
        barres: shape.barres,
        difficulty,
      };

      return [normalized];
    }
  }

  return null;
}

