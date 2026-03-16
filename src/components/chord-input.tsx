import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import * as React from "react";

interface ChordInputProps {
  value: string;
  onChange: (value: string) => void;
  onTransposeClick: () => void;
  onClear?: () => void;
}

export function ChordInput({
  value,
  onChange,
  onTransposeClick,
  onClear,
}: ChordInputProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Saisie des accords
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Collez ou tapez vos grilles, une ou plusieurs lignes.
          </p>
        </div>
        {onClear && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
          >
            Effacer
          </Button>
        )}
      </div>
      <Textarea
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          onChange(e.target.value)
        }
        spellCheck={false}
        rows={8}
        className="text-sm leading-relaxed md:min-h-[200px]"
        placeholder="Exemple :&#10;DoM Rem Sol7&#10;Lam FaM Mim&#10;Do#M Sibm7 Fa#7"
      />
      <div className="flex justify-end">
        <Button type="button" onClick={onTransposeClick}>
          Transposer
        </Button>
      </div>
    </div>
  );
}

