import {
  transposeChordSymbol,
  transposeNote,
  type ParsedChord,
  parseChordSymbol,
} from "./chords";

// Accord avec basse type "DoM/Sol"
interface ParsedSlashChord extends ParsedChord {
  bassRaw?: string;
  bassNote?: string;
}

function parseSlashChord(chord: string): ParsedSlashChord | null {
  const [main, bassPart] = chord.split("/");
  const base = parseChordSymbol(main);
  if (!base) return null;
  if (!bassPart) {
    return base;
  }
  const bassParsed = parseChordSymbol(bassPart);
  if (!bassParsed) {
    return {
      ...base,
      bassRaw: bassPart,
    };
  }
  return {
    ...base,
    bassRaw: bassPart,
    bassNote: bassParsed.rootNote,
  };
}

export function transposeChord(chord: string, semitones: number): string {
  const slashParsed = parseSlashChord(chord);
  if (!slashParsed) {
    // Essaye comme accord simple
    return transposeChordSymbol(chord, semitones);
  }

  const { rootNote, quality, bassRaw, bassNote } = slashParsed;
  const transposedRoot = transposeNote(rootNote, semitones);
  const main = `${transposedRoot}${quality}`;

  if (!bassRaw) return main;
  if (!bassNote) {
    // Basse non reconnue -> conservée telle quelle
    return `${main}/${bassRaw}`;
  }
  const transposedBass = transposeNote(bassNote, semitones);
  return `${main}/${transposedBass}`;
}

function isChordToken(token: string): boolean {
  const trimmed = token.trim();
  if (!trimmed) return false;
  const [main, bassPart] = trimmed.split("/");
  if (!parseChordSymbol(main)) return false;
  if (!bassPart) return true;
  return !!parseChordSymbol(bassPart);
}

function stripOuterPunctuation(token: string): string {
  // Tolère quelques séparateurs usuels autour des accords (ex: "| DoM |", "(Am)", "Ré7,")
  // Sans toucher à "#" "b" "/" "°" "+" qui font partie des tokens d'accord.
  return token.replace(/^[\s|()[\]{},;:.!?]+|[\s|()[\]{},;:.!?]+$/g, "");
}

// Regex pour détecter un "token accord" relativement prudent :
// - commence par une note française (Do, Ré, Mi, Fa, Sol, La, Si) avec alias "Re"
// - peut contenir dièse ou bémol
// - peut suivre avec des lettres/chiffres pour la qualité (M, m, maj7, dim, sus2, add9, 7, °, etc.)
// - optionnellement une basse /NoteQualité
const CHORD_TOKEN_REGEX =
  /(?<!\S)([A-Za-zÀ-ÿ0-9#°+/]+)(?!\S)/g; // tokens séparés par espaces

export function transposeTextPreservingLines(
  text: string,
  semitones: number,
): string {
  if (!text) return "";

  const lines = text.split(/\r?\n/);

  const transformed = lines.map((line) => {
    if (!line.trim()) return line;

    // Si la ligne contient autre chose que des accords (hors ponctuation/| autour),
    // on la laisse intacte.
    for (const match of line.matchAll(/\S+/g)) {
      const rawToken = match[0] ?? "";
      const token = stripOuterPunctuation(rawToken);
      if (!token) continue;
      if (!isChordToken(token)) return line;
    }

    let result = "";
    let lastIndex = 0;

    for (const match of line.matchAll(CHORD_TOKEN_REGEX)) {
      const [token] = match;
      const index = match.index ?? 0;

      // Ajoute le texte brut entre deux tokens
      if (index > lastIndex) {
        result += line.slice(lastIndex, index);
      }

      // On essaie de transposer le token. Si rien n'est reconnu, on le laisse tel quel.
      const transposed = transposeChord(token, semitones);
      result += transposed;

      lastIndex = index + token.length;
    }

    // Ajoute la fin de ligne restante
    if (lastIndex < line.length) {
      result += line.slice(lastIndex);
    }

    return result;
  });

  return transformed.join("\n");
}

