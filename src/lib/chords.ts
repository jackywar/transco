export type NoteName =
  | "Do"
  | "Do#"
  | "Ré"
  | "Ré#"
  | "Mi"
  | "Fa"
  | "Fa#"
  | "Sol"
  | "Sol#"
  | "La"
  | "La#"
  | "Si";

// Internal chromatic scale in French notation.
// Convention choisie (documentée) :
// - sortie toujours avec dièses (#), jamais de bémols
// - ordre : Do, Do#, Ré, Ré#, Mi, Fa, Fa#, Sol, Sol#, La, La#, Si
export const CHROMATIC_SCALE: NoteName[] = [
  "Do",
  "Do#",
  "Ré",
  "Ré#",
  "Mi",
  "Fa",
  "Fa#",
  "Sol",
  "Sol#",
  "La",
  "La#",
  "Si",
];

// Correspondances d'alias y compris les bémols d'entrée.
const NOTE_ALIASES: Record<string, NoteName> = {
  do: "Do",
  "do#": "Do#",
  ré: "Ré",
  re: "Ré",
  "ré#": "Ré#",
  "re#": "Ré#",
  mi: "Mi",
  fa: "Fa",
  "fa#": "Fa#",
  sol: "Sol",
  "sol#": "Sol#",
  la: "La",
  "la#": "La#",
  si: "Si",
  // notation américaine (A-G), avec altérations éventuelles
  c: "Do",
  "c#": "Do#",
  cb: "Si",
  "c♭": "Si",
  "c♯": "Do#",
  d: "Ré",
  "d#": "Ré#",
  db: "Do#",
  "d♭": "Do#",
  "d♯": "Ré#",
  e: "Mi",
  "e#": "Fa",
  eb: "Ré#",
  "e♭": "Ré#",
  "e♯": "Fa",
  f: "Fa",
  "f#": "Fa#",
  fb: "Mi",
  "f♭": "Mi",
  "f♯": "Fa#",
  g: "Sol",
  "g#": "Sol#",
  gb: "Fa#",
  "g♭": "Fa#",
  "g♯": "Sol#",
  a: "La",
  "a#": "La#",
  ab: "Sol#",
  "a♭": "Sol#",
  "a♯": "La#",
  b: "Si",
  "b#": "Do",
  bb: "La#",
  "b♭": "La#",
  "b♯": "Do",
  // bémols fréquents, normalisés en dièses équivalents
  "réb": "Do#",
  "reb": "Do#",
  "mib": "Ré#",
  "solb": "Fa#",
  "lab": "Sol#",
  "sib": "La#",
};

export function normalizeNote(raw: string): NoteName | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  const mapped = NOTE_ALIASES[lower];
  if (mapped) return mapped;
  // Tente une correspondance directe en respectant la casse exacte attendue
  if ((CHROMATIC_SCALE as string[]).includes(trimmed)) {
    return trimmed as NoteName;
  }
  return null;
}

function noteToIndex(note: NoteName): number {
  return CHROMATIC_SCALE.indexOf(note);
}

function indexToNote(index: number): NoteName {
  const len = CHROMATIC_SCALE.length;
  const wrapped = ((index % len) + len) % len;
  return CHROMATIC_SCALE[wrapped];
}

export function transposeNote(raw: string, semitones: number): string {
  const normalized = normalizeNote(raw);
  if (!normalized) return raw;
  const idx = noteToIndex(normalized);
  if (idx === -1) return raw;
  const target = indexToNote(idx + semitones);
  return target;
}

export interface ParsedChord {
  rootRaw: string;
  rootNote: string;
  quality: string;
  bassRaw?: string;
  bassNote?: string;
}

// Regex pragmatique :
// - ^(?<root>Do|Ré|Re|Mi|Fa|Sol|La|Si)(?<accidental>#|b)? : racine + altération éventuelle
// - (?<quality>.*) : tout ce qui suit (suffixe de qualité, extensions, etc.)
// Le parsing de la basse se fera dans parseChordWithBass (voir parse-chords.ts).
const ROOT_REGEX =
  /^(?<root>Do|Ré|Re|Mi|Fa|Sol|La|Si|[A-G])(?<accidental>#|b)?(?<quality>.*)$/i;

// Qualités/suffixes d'accords acceptés, sous forme de "segments" concaténés.
// Objectif : éviter de transformer du texte normal (ex: "Couplet") en "accord".
// Exemples acceptés : "", "M", "m", "7", "maj7", "m7b5", "sus4", "add9", "dim7", "7sus4".
const QUALITY_SEGMENTS_REGEX =
  /^(?:(?:maj7|m7|M7|maj|min|dim|aug|sus(?:2|4)?|add\d+|[0-9]{1,2}|[#b](?:5|9|11|13)|°|ø|\+|M|m))+$/i;

export function parseChordSymbol(chord: string): ParsedChord | null {
  const match = chord.match(ROOT_REGEX);
  if (!match || !match.groups) return null;
  const { root, accidental, quality } = match.groups;
  const rootRaw = `${root}${accidental ?? ""}`;
  const normalized = normalizeNote(rootRaw);
  if (!normalized) return null;
  const q = (quality ?? "").trim();
  if (q && !QUALITY_SEGMENTS_REGEX.test(q)) return null;
  return {
    rootRaw,
    rootNote: normalized,
    quality: quality ?? "",
  };
}

export function transposeChordSymbol(chord: string, semitones: number): string {
  const parsed = parseChordSymbol(chord);
  if (!parsed) return chord;
  const transposedRoot = transposeNote(parsed.rootNote, semitones);
  return `${transposedRoot}${parsed.quality}`;
}

