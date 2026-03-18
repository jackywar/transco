import * as React from "react";
import { lookupChordDiagramFromFrench } from "@/lib/chord-lookup";
import { extractChordParts } from "@/lib/chord-notation";

type DifficultyCache = Map<string, number | null>;

export function useChordDifficulties(chords: string[]) {
  const [difficulties, setDifficulties] = React.useState<DifficultyCache>(
    new Map()
  );

  React.useEffect(() => {
    let cancelled = false;

    async function fetchDifficulties() {
      const uniqueChords = [...new Set(chords)].filter((chord) => {
        const parts = extractChordParts(chord);
        return parts !== null;
      });

      const newDifficulties = new Map<string, number | null>(difficulties);

      for (const chord of uniqueChords) {
        if (newDifficulties.has(chord)) continue;

        try {
          const diagrams = await lookupChordDiagramFromFrench(chord);
          if (cancelled) return;

          if (diagrams && diagrams.length > 0 && diagrams[0].difficulty) {
            newDifficulties.set(chord, diagrams[0].difficulty.score);
          } else {
            newDifficulties.set(chord, null);
          }
        } catch {
          if (cancelled) return;
          newDifficulties.set(chord, null);
        }
      }

      if (!cancelled) {
        setDifficulties(newDifficulties);
      }
    }

    fetchDifficulties();

    return () => {
      cancelled = true;
    };
  }, [chords.join(",")]);

  return difficulties;
}
