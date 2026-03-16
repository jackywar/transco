declare module "@tombatossals/chords-db/src/db/guitar" {
  // Minimal shape needed by src/lib/chord-db.ts
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

  type GuitarDb = {
    chords: {
      [key: string]: DbChordEntry[];
    };
  };

  const guitarDb: GuitarDb;
  export default guitarDb;
}

