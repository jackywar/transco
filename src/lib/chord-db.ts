import guitarDb from "@tombatossals/chords-db/src/db/guitar";
import { normalizeInputText } from "./chord-notation";

export type DbChordShape = {
  baseFret: number;
  frets: (number | -1)[];
  fingers?: (number | 0 | null)[];
  barres?: { fromString: number; toString: number; fret: number }[];
};

type DbChordPosition = {
  frets: string;
  fingers?: string;
  barres?: number;
  capo?: boolean;
};

type DbChordEntry = {
  key: string;
  suffix: string;
  positions: DbChordPosition[];
};

export interface ParsedEnglishChord {
  root: string;
  accidental: "#" | "b" | null;
  suffix: string;
}

export function parseEnglishChord(chord: string): ParsedEnglishChord | null {
  const trimmed = normalizeInputText(chord);
  const match = trimmed.match(/^([A-G])(#|b)?(.*)$/);
  if (!match) return null;

  const [, root, accidental, rest] = match;
  return {
    root,
    accidental: (accidental as "#" | "b" | undefined) ?? null,
    suffix: (rest ?? "").trim(),
  };
}

export function normalizeChordForDb(chord: string): string {
  return normalizeInputText(chord);
}

function parseFretChar(ch: string): number | -1 {
  if (ch === "x" || ch === "X") return -1;
  if (ch >= "0" && ch <= "9") return Number(ch);
  const lower = ch.toLowerCase();
  if (lower >= "a" && lower <= "z") {
    return lower.charCodeAt(0) - "a".charCodeAt(0) + 10;
  }
  return -1;
}

function parseFrets(frets: string): (number | -1)[] {
  return frets.split("").map(parseFretChar);
}

function parseFingers(fingers: string | undefined): (number | 0 | null)[] | undefined {
  if (!fingers) return undefined;
  return fingers.split("").map((ch) => {
    if (ch === "0") return 0;
    if (ch >= "1" && ch <= "9") return Number(ch);
    const lower = ch.toLowerCase();
    if (lower >= "a" && lower <= "z") {
      return lower.charCodeAt(0) - "a".charCodeAt(0) + 10;
    }
    return null;
  });
}

function computeBaseFret(frets: (number | -1)[]): number {
  const used = frets.filter((f) => typeof f === "number" && f > 0) as number[];
  if (!used.length) return 1;
  return Math.min(...used);
}

function keyToDbProperty(key: string): keyof typeof guitarDb.chords | null {
  // Dans la db, C# et F# sont nommés Csharp/Fsharp.
  if (key === "C#") return "Csharp";
  if (key === "F#") return "Fsharp";
  if (key === "Eb") return "Eb";
  if (key === "Ab") return "Ab";
  if (key === "Bb") return "Bb";
  if (key === "C") return "C";
  if (key === "D") return "D";
  if (key === "E") return "E";
  if (key === "F") return "F";
  if (key === "G") return "G";
  if (key === "A") return "A";
  if (key === "B") return "B";
  return null;
}

export function findChordShapesByKeySuffix(
  key: string,
  suffix: string,
): DbChordShape[] {
  const prop = keyToDbProperty(key);
  if (!prop) return [];

  const entries = (guitarDb.chords[prop] as unknown as DbChordEntry[]) ?? [];
  const found = entries.find((e) => e.key === key && e.suffix === suffix);
  if (!found) return [];

  return found.positions.map((p) => {
    const frets = parseFrets(p.frets);
    const baseFret = computeBaseFret(frets);
    const fingers = parseFingers(p.fingers);
    const barres =
      typeof p.barres === "number"
        ? [
            {
              fromString: 6,
              toString: 1,
              fret: p.barres,
            },
          ]
        : [];

    return {
      baseFret,
      frets,
      fingers,
      barres: p.capo ? barres : barres,
    };
  });
}

export function findChordShapes(chord: string): DbChordShape[] {
  // chord = "C#m7" etc. Ici, on s'attend à ce que normalizeChordForDb ait déjà fait le nettoyage.
  const normalized = normalizeChordForDb(chord);
  const match = normalized.match(/^([A-G](?:#|b)?)(.*)$/);
  if (!match) return [];

  const [, key, suffixRaw] = match;
  const suffix = suffixRaw ?? "";

  // mapping minimal vers suffixes chords-db
  const lower = suffix.toLowerCase();
  let dbSuffix = suffix;
  if (!suffix) dbSuffix = "major";
  else if (lower === "m" || lower === "min") dbSuffix = "minor";
  else if (lower === "m7" || lower === "min7") dbSuffix = "m7";
  else if (lower === "maj7" || lower === "m7" || lower === "m7") dbSuffix = lower;
  else if (lower === "m7" || lower === "min7") dbSuffix = "m7";
  else if (lower === "dim" || suffix === "°") dbSuffix = "dim";
  else if (lower === "7") dbSuffix = "7";
  else if (lower === "sus2" || lower === "sus4" || lower === "add9") dbSuffix = lower;
  else if (lower === "maj") dbSuffix = "major";

  return findChordShapesByKeySuffix(key, dbSuffix);
}

export function getBestChordShape(chord: string): DbChordShape | null {
  const shapes = findChordShapes(chord);
  if (!shapes.length) return null;
  return shapes[0];
}

