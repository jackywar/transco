import * as React from "react";
import {
  difficultyToBorderColor,
  difficultyToBackgroundColor,
} from "@/lib/chord-difficulty";

interface ChordTokenProps {
  chord: string;
  onClick: () => void;
  difficultyScore?: number;
}

export function ChordToken({ chord, onClick, difficultyScore }: ChordTokenProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  const hasDifficulty = difficultyScore !== undefined;
  const borderColor = hasDifficulty
    ? difficultyToBorderColor(difficultyScore)
    : undefined;
  const backgroundColor = hasDifficulty
    ? difficultyToBackgroundColor(difficultyScore)
    : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="rounded px-1 py-0.5 text-[0.9em] font-semibold text-zinc-900 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-50 transition-colors"
      style={
        hasDifficulty
          ? {
              backgroundColor,
              borderWidth: "2px",
              borderStyle: "solid",
              borderColor,
            }
          : undefined
      }
    >
      {chord}
    </button>
  );
}

