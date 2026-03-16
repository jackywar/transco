import * as React from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const classes = ["flex flex-col space-y-1.5 p-4", className]
    .filter(Boolean)
    .join(" ");
  return <div className={classes} {...props} />;
}

export function DialogTitle({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const classes = [
    "text-base font-semibold leading-none tracking-tight",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <h2 className={classes} {...props} />;
}

export function DialogDescription({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const classes = ["text-xs text-zinc-500 dark:text-zinc-400", className]
    .filter(Boolean)
    .join(" ");
  return <p className={classes} {...props} />;
}

export function DialogContent({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const classes = ["px-4 pb-4 pt-2", className].filter(Boolean).join(" ");
  return <div className={classes} {...props} />;
}

export function DialogFooter({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const classes = ["flex items-center justify-end gap-2 px-4 pb-4", className]
    .filter(Boolean)
    .join(" ");
  return <div className={classes} {...props} />;
}

