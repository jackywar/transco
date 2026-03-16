import * as React from "react";

interface ChordTokenProps {
  chord: string;
  onClick: () => void;
}

export function ChordToken({ chord, onClick }: ChordTokenProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="rounded px-0.5 text-[0.9em] font-semibold text-zinc-900 underline decoration-dotted underline-offset-2 hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-50 dark:hover:bg-zinc-900"
    >
      {chord}
    </button>
  );
}

