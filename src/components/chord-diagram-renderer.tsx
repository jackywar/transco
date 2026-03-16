"use client";

import * as React from "react";
import { OPEN, SILENT, SVGuitarChord } from "svguitar";
import type { NormalizedChordDiagram } from "@/lib/chord-lookup";

interface ChordDiagramRendererProps {
  diagram: NormalizedChordDiagram;
}

export function ChordDiagramRenderer({ diagram }: ChordDiagramRendererProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    const chord = new SVGuitarChord(containerRef.current);

    const frets = diagram.frets;
    const fingers: Array<[number, number | 0 | "x"]> = frets.map((f, i) => {
      const stringNumber = 6 - i; // notre ordre: [E A D G B E] = cordes 6..1
      if (f === "x") return [stringNumber, SILENT];
      if (f === 0) return [stringNumber, OPEN];
      return [stringNumber, f];
    });

    chord
      .configure({
        strings: 6,
        frets: 5,
        tuning: ["E", "A", "D", "G", "B", "E"],
        fretLabelFontSize: 9,
        position: diagram.baseFret,
      })
      .chord({
        title: diagram.title,
        position: diagram.baseFret,
        fingers,
        barres: (diagram.barres ?? []).map((b) => ({
          fromString: b.fromString,
          toString: b.toString,
          fret: b.fret,
        })),
      })
      .draw();
  }, [diagram]);

  return (
    <div
      ref={containerRef}
      className="mx-auto h-[180px] w-[160px] text-zinc-900 dark:text-zinc-50"
      aria-hidden="true"
    />
  );
}

