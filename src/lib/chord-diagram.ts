import { lookupChordDiagramFromFrench } from "./chord-lookup";

export async function fetchChordDiagram(frenchChord: string) {
  return lookupChordDiagramFromFrench(frenchChord);
}

