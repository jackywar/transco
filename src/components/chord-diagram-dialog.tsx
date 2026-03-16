import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChordDiagramRenderer } from "@/components/chord-diagram-renderer";
import { fetchChordDiagram } from "@/lib/chord-diagram";

interface ChordDiagramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  frenchName: string | null;
  englishName: string | null;
}

export function ChordDiagramDialog({
  open,
  onOpenChange,
  frenchName,
  englishName,
}: ChordDiagramDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [variantIndex, setVariantIndex] = React.useState(0);
  const [variantsCount, setVariantsCount] = React.useState(0);
  const [current, setCurrent] = React.useState<Awaited<
    ReturnType<typeof fetchChordDiagram>
  > | null>(null);

  React.useEffect(() => {
    if (!open || !englishName || !frenchName) {
      setLoading(false);
      setError(null);
      setCurrent(null);
      setVariantsCount(0);
      setVariantIndex(0);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchChordDiagram(frenchName ?? englishName);
        if (cancelled) return;
        if (!result || result.length === 0) {
          setCurrent(null);
          setVariantsCount(0);
        } else {
          setCurrent(result);
          setVariantsCount(result.length);
          setVariantIndex(0);
        }
      } catch {
        if (cancelled) return;
        setError("Erreur lors du chargement du diagramme.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, englishName, frenchName]);

  const hasDiagram = !!current && current.length > 0;
  const diagram = hasDiagram && current ? current[variantIndex] : null;

  const title = frenchName ?? "Accord";
  const subtitle = englishName
    ? `Équivalent anglais : ${englishName}`
    : "Accord non reconnu en notation anglaise";

  const handleClose = () => onOpenChange(false);

  const handleNextVariant = () => {
    if (!hasDiagram || variantsCount <= 1) return;
    setVariantIndex((prev) => (prev + 1) % variantsCount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{subtitle}</DialogDescription>
      </DialogHeader>
      <DialogContent>
        {loading && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Chargement du diagramme…
          </p>
        )}
        {!loading && error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        {!loading && !error && !hasDiagram && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {frenchName && englishName
              ? `Aucun diagramme trouvé pour ${frenchName} (${englishName}).`
              : "Aucun diagramme trouvé pour cet accord."}
          </p>
        )}
        {!loading && !error && diagram && (
          <div className="space-y-2">
            <ChordDiagramRenderer diagram={diagram} />
            {variantsCount > 1 && (
              <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
                Variante {variantIndex + 1} sur {variantsCount}
              </p>
            )}
          </div>
        )}
      </DialogContent>
      <DialogFooter>
        {variantsCount > 1 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleNextVariant}
          >
            Variante suivante
          </Button>
        )}
        <Button type="button" size="sm" onClick={handleClose}>
          Fermer
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

