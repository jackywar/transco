import { Button } from "@/components/ui/button";

interface TransposeControlsProps {
  onStep: (delta: number) => void;
  currentSemitones: number;
  disabled?: boolean;
}

export function TransposeControls({
  onStep,
  currentSemitones,
  disabled,
}: TransposeControlsProps) {
  const label =
    currentSemitones === 0
      ? "Transposition actuelle : 0 demi-ton"
      : currentSemitones > 0
        ? `Transposition actuelle : +${currentSemitones} demi-ton${
            currentSemitones > 1 ? "s" : ""
          }`
        : `Transposition actuelle : ${currentSemitones} demi-ton${
            currentSemitones < -1 ? "s" : ""
          }`;

  return (
    <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800 md:flex-row md:items-center md:justify-between">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="lg"
          variant="outline"
          disabled={disabled}
          onClick={() => onStep(-1)}
        >
          –
        </Button>
        <Button
          type="button"
          size="lg"
          disabled={disabled}
          onClick={() => onStep(1)}
        >
          +
        </Button>
      </div>
    </div>
  );
}

