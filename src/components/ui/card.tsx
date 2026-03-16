import * as React from "react";

export function Card({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const classes = [
    "rounded-xl border border-zinc-200 bg-white/80 shadow-sm backdrop-blur-sm",
    "dark:border-zinc-800 dark:bg-zinc-950/80",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} {...props} />;
}

export function CardHeader({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const classes = ["flex flex-col space-y-1.5 p-6", className]
    .filter(Boolean)
    .join(" ");
  return <div className={classes} {...props} />;
}

export function CardTitle({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const classes = [
    "text-lg font-semibold leading-none tracking-tight",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <h3 className={classes} {...props} />;
}

export function CardDescription({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const classes = ["text-sm text-zinc-500 dark:text-zinc-400", className]
    .filter(Boolean)
    .join(" ");
  return <p className={classes} {...props} />;
}

export function CardContent({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const classes = ["p-6 pt-0", className].filter(Boolean).join(" ");
  return <div className={classes} {...props} />;
}

export function CardFooter({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const classes = ["flex items-center p-6 pt-0", className]
    .filter(Boolean)
    .join(" ");
  return <div className={classes} {...props} />;
}

