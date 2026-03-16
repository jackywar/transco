import { Button } from "@/components/ui/button";
import * as React from "react";
import { ChordToken } from "@/components/chord-token";
import { ChordDiagramDialog } from "@/components/chord-diagram-dialog";
import {
  convertFrenchChordToEnglish,
  extractChordParts,
} from "@/lib/chord-notation";

interface ChordOutputProps {
  value: string;
  visible: boolean;
}

const CHORD_TOKEN_REGEX =
  /(?<!\S)([A-Za-zÀ-ÿ0-9#°+/]+)(?!\S)/g;

export function ChordOutput({ value, visible }: ChordOutputProps) {
  const [copied, setCopied] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedFrenchChord, setSelectedFrenchChord] = React.useState<
    string | null
  >(null);
  const [selectedEnglishChord, setSelectedEnglishChord] = React.useState<
    string | null
  >(null);

  if (!visible) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard errors silently
    }
  };

  const handleChordClick = (token: string) => {
    const parts = extractChordParts(token);
    const english = convertFrenchChordToEnglish(token);
    if (!parts || !english) {
      setSelectedFrenchChord(token);
      setSelectedEnglishChord(null);
      setDialogOpen(true);
      return;
    }

    setSelectedFrenchChord(token);
    setSelectedEnglishChord(english);
    setDialogOpen(true);
  };

  const renderLine = (line: string, lineIndex: number) => {
    if (!line.trim()) {
      return <div key={lineIndex}>&nbsp;</div>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    for (const match of line.matchAll(CHORD_TOKEN_REGEX)) {
      const [token] = match;
      const index = match.index ?? 0;

      if (index > lastIndex) {
        elements.push(
          <span key={`${lineIndex}-text-${index}`}>
            {line.slice(lastIndex, index)}
          </span>,
        );
      }

      const isChord = !!extractChordParts(token);

      if (isChord) {
        elements.push(
          <ChordToken
            key={`${lineIndex}-chord-${index}`}
            chord={token}
            onClick={() => handleChordClick(token)}
          />,
        );
      } else {
        elements.push(
          <span key={`${lineIndex}-plain-${index}`}>{token}</span>,
        );
      }

      lastIndex = index + token.length;
    }

    if (lastIndex < line.length) {
      elements.push(
        <span key={`${lineIndex}-tail`}>{line.slice(lastIndex)}</span>,
      );
    }

    return (
      <div key={lineIndex} className="whitespace-pre-wrap">
        {elements}
      </div>
    );
  };

  const lines = value.split(/\r?\n/);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Résultat transposé
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Cliquez sur un accord pour voir un diagramme de guitare.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
        >
          {copied ? "Copié !" : "Copier le résultat"}
        </Button>
      </div>
      <div className="max-h-[320px] overflow-auto rounded-md border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-900 shadow-inner dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
        {value ? (
          lines.map((line, index) => renderLine(line, index))
        ) : (
          <span className="text-zinc-400">
            Aucun résultat pour le moment.
          </span>
        )}
      </div>
      <ChordDiagramDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        frenchName={selectedFrenchChord}
        englishName={selectedEnglishChord}
      />
    </div>
  );
}

