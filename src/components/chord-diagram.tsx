import * as React from "react";
import type { NormalizedChordDiagram } from "@/lib/chord-lookup";

interface ChordDiagramProps {
  diagram: NormalizedChordDiagram;
}

const STRING_LABELS = ["E", "A", "D", "G", "B", "E"];

export function ChordDiagram({ diagram }: ChordDiagramProps) {
  const { frets, baseFret = 1 } = diagram;

  const numericFrets = frets.filter(
    (f): f is number => typeof f === "number" && f > 0,
  );
  const maxFret = numericFrets.length > 0 ? Math.max(...numericFrets) : baseFret;
  const span = Math.max(4, maxFret - baseFret + 1);

  const width = 140;
  const height = 160;
  const leftMargin = 24;
  const rightMargin = 8;
  const topMargin = 24;
  const bottomMargin = 24;

  const stringCount = 6;
  const stringSpacing =
    (width - leftMargin - rightMargin) / (stringCount - 1 || 1);
  const fretSpacing =
    (height - topMargin - bottomMargin) / (span > 0 ? span : 1);

  const fretForIndex = (index: number) => baseFret + index;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto block text-zinc-900 dark:text-zinc-50"
      aria-hidden="true"
    >
      {/* cordes */}
      {Array.from({ length: stringCount }).map((_, i) => {
        const x = leftMargin + i * stringSpacing;
        return (
          <line
            key={`string-${i}`}
            x1={x}
            y1={topMargin}
            x2={x}
            y2={height - bottomMargin}
            stroke="currentColor"
            strokeWidth={1}
          />
        );
      })}

      {/* frettes */}
      {Array.from({ length: span + 1 }).map((_, i) => {
        const y = topMargin + i * fretSpacing;
        return (
          <line
            key={`fret-${i}`}
            x1={leftMargin}
            x2={width - rightMargin}
            y1={y}
            y2={y}
            stroke="currentColor"
            strokeWidth={i === 0 && baseFret === 1 ? 2 : 1}
          />
        );
      })}

      {/* numéros de case */}
      {baseFret > 1 && (
        <text
          x={8}
          y={topMargin + fretSpacing / 2}
          fontSize={10}
          fill="currentColor"
        >
          {baseFret}
        </text>
      )}

      {/* repères corde : X / O / ● */}
      {frets.map((fret, stringIndex) => {
        const x = leftMargin + stringIndex * stringSpacing;

        if (fret === "x") {
          return (
            <text
              key={`mute-${stringIndex}`}
              x={x}
              y={topMargin - 8}
              textAnchor="middle"
              fontSize={10}
              fill="currentColor"
            >
              X
            </text>
          );
        }

        if (fret === 0) {
          return (
            <text
              key={`open-${stringIndex}`}
              x={x}
              y={topMargin - 8}
              textAnchor="middle"
              fontSize={10}
              fill="currentColor"
            >
              O
            </text>
          );
        }

        const numericFret = fret as number;
        const fretIndex =
          fretForIndex(0) === numericFret ? 0 : numericFret - baseFret;
        const y =
          topMargin +
          fretIndex * fretSpacing +
          fretSpacing / 2;

        return (
          <circle
            key={`dot-${stringIndex}`}
            cx={x}
            cy={y}
            r={6}
            fill="currentColor"
          />
        );
      })}

      {/* labels de cordes en bas */}
      {STRING_LABELS.map((label, i) => {
        const x = leftMargin + i * stringSpacing;
        return (
          <text
            key={`label-${i}`}
            x={x}
            y={height - 6}
            textAnchor="middle"
            fontSize={9}
            fill="currentColor"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

