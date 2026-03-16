 "use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChordInput } from "@/components/chord-input";
import { ChordOutput } from "@/components/chord-output";
import { TransposeControls } from "@/components/transpose-controls";
import { transposeTextPreservingLines } from "@/lib/parse-chords";
import { useState } from "react";

const EXAMPLE_TEXT = `DoM Rem Sol7
Lam FaM Mim
Do#M Sibm7 Fa#7

Texte libre : couplet 1
DoM/Sol  FaM  Sol7  DoM`;

export default function Home() {
  const [inputText, setInputText] = useState<string>(EXAMPLE_TEXT);
  const [baseOutput, setBaseOutput] = useState<string>("");
  const [currentSemitones, setCurrentSemitones] = useState<number>(0);
  const [displayedOutput, setDisplayedOutput] = useState<string>("");
  const [hasOutput, setHasOutput] = useState<boolean>(false);

  const handleTransposeClick = () => {
    const initial = transposeTextPreservingLines(inputText, 0);
    setBaseOutput(initial);
    setDisplayedOutput(initial);
    setCurrentSemitones(0);
    setHasOutput(true);
  };

  const handleStep = (delta: number) => {
    if (!hasOutput) return;
    const next = currentSemitones + delta;
    const transposed = transposeTextPreservingLines(baseOutput, next);
    setCurrentSemitones(next);
    setDisplayedOutput(transposed);
  };

  const handleClear = () => {
    setInputText("");
    setBaseOutput("");
    setDisplayedOutput("");
    setCurrentSemitones(0);
    setHasOutput(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 px-4 py-8 text-zinc-900 dark:from-zinc-950 dark:to-zinc-900 dark:text-zinc-50">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Transposition d&apos;accords
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 md:text-base">
            Collez vos grilles d&apos;accords en notation française, puis
            transposez-les instantanément demi-ton par demi-ton.
          </p>
        </header>

        <Card className="mt-2">
          <CardHeader>
            <CardTitle>Outil de transposition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ChordInput
              value={inputText}
              onChange={setInputText}
              onTransposeClick={handleTransposeClick}
              onClear={handleClear}
            />

            <ChordOutput value={displayedOutput} visible={hasOutput} />

            <TransposeControls
              onStep={handleStep}
              currentSemitones={currentSemitones}
              disabled={!hasOutput}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

