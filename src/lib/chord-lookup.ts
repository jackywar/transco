import {
  convertFrenchChordToEnglish,
  getChordLookupCandidates,
  normalizeInputText,
} from "./chord-notation";
import { getBestChordShape } from "./chord-db";

export type NormalizedChordDiagram = {
  title: string;
  baseFret: number;
  frets: Array<number | "x" | 0>;
  fingers?: Array<number | null>;
  barres?: Array<{ fromString: number; toString: number; fret: number }>;
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
      const normalized: NormalizedChordDiagram = {
        title: english,
        baseFret: shape.baseFret,
        frets: shape.frets.map((f) => (f < 0 ? "x" : f)) as Array<
          number | "x" | 0
        >,
        fingers: shape.fingers?.map((f) => (f === 0 ? null : f)) ?? undefined,
        barres: shape.barres,
      };

      return [normalized];
    }
  }

  return null;
}

