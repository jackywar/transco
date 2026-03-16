import { normalizeNote } from "./chords";

export interface ChordParts {
  root: string;
  suffix: string;
  bass?: string;
}

// Normalise une chaîne pour le parsing :
// - NFC pour gérer les accents combinés (ex. "Ré" -> "Ré")
// - suppression des caractères zero-width
// - trim des espaces
export function normalizeInputText(value: string): string {
  if (!value) return "";
  let normalized = value;
  if (typeof normalized.normalize === "function") {
    normalized = normalized.normalize("NFC");
  }
  // supprime les chars zero-width fréquents
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF]/g, "");
  return normalized.trim();
}

export function normalizeFrenchChordToken(token: string): string {
  return normalizeInputText(token);
}

// Parsing pragmatique des accords français, incluant certains bémols (Mib, Lab, Sib).
const FRENCH_ROOT_REGEX =
  /^(Do#?|Ré#?|Re#?|Mib|Mi|Fa#?|Sol#?|Lab|La#?|Sib|Si)(?<suffix>.*)$/i;

export function extractChordParts(chord: string): ChordParts | null {
  const normalizedChord = normalizeFrenchChordToken(chord);
  const [main, bass] = normalizedChord.split("/");

  const mainMatch = main.match(FRENCH_ROOT_REGEX);
  if (!mainMatch) return null;

  const root = mainMatch[1] ?? "";
  const suffix = (mainMatch.groups?.suffix ?? "").trim();

  const result: ChordParts = {
    root,
    suffix,
  };

  if (bass) {
    result.bass = bass.trim();
  }

  return result;
}

const FRENCH_TO_ENGLISH_NOTES: Record<string, string> = {
  // Do
  do: "C",
  "do#": "C#",
  // Ré / Re
  ré: "D",
  re: "D",
  "ré#": "D#",
  "re#": "D#",
  "réb": "Db",
  "reb": "Db",
  // Mi
  mi: "E",
  mib: "Eb",
  // Fa
  fa: "F",
  "fa#": "F#",
  "fab": "Fb",
  // Sol
  sol: "G",
  "sol#": "G#",
  solb: "Gb",
  // La
  la: "A",
  "la#": "A#",
  lab: "Ab",
  // Si
  si: "B",
  sib: "Bb",
};

export function convertFrenchNoteToEnglish(note: string): string {
  const trimmed = normalizeInputText(note);
  if (!trimmed) return note;

  const lower = trimmed.toLowerCase();
  const manual = FRENCH_TO_ENGLISH_NOTES[lower];
  if (manual) return manual;

  // Fallback : utilise la note normalisée (dièses uniquement) puis mappe par hauteur.
  const normalized = normalizeNote(trimmed);
  if (!normalized) return note;

  switch (normalized) {
    case "Do":
      return "C";
    case "Do#":
      return "C#";
    case "Ré":
      return "D";
    case "Ré#":
      return "D#";
    case "Mi":
      return "E";
    case "Fa":
      return "F";
    case "Fa#":
      return "F#";
    case "Sol":
      return "G";
    case "Sol#":
      return "G#";
    case "La":
      return "A";
    case "La#":
      return "A#";
    case "Si":
      return "B";
    default:
      return note;
  }
}

function mapSuffixToEnglish(suffix: string): string {
  const trimmed = suffix.trim();
  if (!trimmed) return "";

  if (trimmed === "M") return "";
  if (trimmed === "M7") return "maj7";

  const lower = trimmed.toLowerCase();

  if (lower === "maj") return "maj";
  if (lower === "maj7") return "maj7";
  if (lower === "m") return "m";
  if (lower === "m7") return "m7";
  if (lower === "7") return "7";
  if (trimmed === "°" || lower === "dim") return "dim";
  if (lower.startsWith("sus")) return trimmed;
  if (lower.startsWith("add")) return trimmed;

  return trimmed;
}

export function convertFrenchChordToEnglish(chord: string): string | null {
  const normalized = normalizeFrenchChordToken(chord);
  const parts = extractChordParts(normalized);
  if (!parts) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(
        `[chord-convert] french="${chord}" normalized="${normalized}" english=null`,
      );
    }
    return null;
  }

  const englishRoot = convertFrenchNoteToEnglish(parts.root);
  const englishSuffix = mapSuffixToEnglish(parts.suffix);
  const main = `${englishRoot}${englishSuffix}`;

  let full = main;

  if (parts.bass) {
    const bass = parts.bass;
    const bassMatch = bass.match(FRENCH_ROOT_REGEX);
    if (!bassMatch) {
      full = `${main}/${bass}`;
    } else {
      const bassRoot = bassMatch[1] ?? "";
      const bassRest = (bassMatch.groups?.suffix ?? "").trim();
      const englishBassRoot = convertFrenchNoteToEnglish(bassRoot);
      const englishBass = `${englishBassRoot}${bassRest}`;
      full = `${main}/${englishBass}`;
    }
  }

  if (process.env.NODE_ENV !== "production") {
    console.debug(
      `[chord-convert] french="${chord}" normalized="${normalized}" english="${full}"`,
    );
  }

  return full;
}

// Génère des candidats de lookup pour un accord anglais (racine+suffixe)
// ex: D -> ["D","Dmaj","DM"], Dm -> ["Dm","Dmin"], Dmaj7 -> ["Dmaj7","DM7"], Ddim -> ["Ddim","D°"]
export function getChordLookupCandidates(englishChord: string): string[] {
  const trimmed = normalizeInputText(englishChord);
  const [main, bass] = trimmed.split("/");

  const mainMatch = main.match(/^([A-G](?:#|b)?)(.*)$/);
  if (!mainMatch) return [trimmed];

  const [, root, rawSuffix] = mainMatch;
  const suffix = rawSuffix ?? "";
  const lowerSuffix = suffix.toLowerCase();

  const enharmonic = (note: string): string | null => {
    const map: Record<string, string> = {
      "C#": "Db",
      Db: "C#",
      "D#": "Eb",
      Eb: "D#",
      "F#": "Gb",
      Gb: "F#",
      "G#": "Ab",
      Ab: "G#",
      "A#": "Bb",
      Bb: "A#",
    };
    return map[note] ?? null;
  };

  const rootCandidates = (() => {
    const e = enharmonic(root);
    return e ? [root, e] : [root];
  })();

  const bassCandidates = (() => {
    if (!bass) return [null] as const;
    const bassNoteMatch = bass.match(/^([A-G](?:#|b)?)(.*)$/);
    if (!bassNoteMatch) return [bass] as const;
    const bassRoot = bassNoteMatch[1] ?? bass;
    const bassRest = bassNoteMatch[2] ?? "";
    const e = enharmonic(bassRoot);
    return e ? [`${bassRoot}${bassRest}`, `${e}${bassRest}`] : [`${bassRoot}${bassRest}`];
  })();

  const mainVariants = (r: string): string[] => {
    // majeurs simples (pas de suffixe)
    if (!suffix) return [r, `${r}maj`, `${r}M`];

    if (lowerSuffix === "m") return [`${r}m`, `${r}min`];
    if (lowerSuffix === "m7") return [`${r}m7`, `${r}min7`];

    if (lowerSuffix === "maj7") return [`${r}maj7`, `${r}M7`];
    if (lowerSuffix === "dim") return [`${r}dim`, `${r}°`];

    // suffixes non mappés : on garde tel quel
    return [`${r}${suffix}`];
  };

  const out: string[] = [];
  for (const r of rootCandidates) {
    for (const v of mainVariants(r)) {
      for (const b of bassCandidates) {
        out.push(b ? `${v}/${b}` : v);
      }
    }
  }

  // Dé-dup en conservant l’ordre
  return Array.from(new Set(out));
}

