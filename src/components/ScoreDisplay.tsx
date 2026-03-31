import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const scoreVariants = cva(
  "inline-flex items-center justify-center rounded-full font-display font-bold shadow-sm transition-all duration-300",
  {
    variants: {
      size: {
        sm: "h-11 w-11 text-sm",
        md: "h-16 w-16 text-lg",
        lg: "h-22 w-22 text-2xl",
        xl: "h-28 w-28 text-3xl",
      },
      level: {
        high: "bg-gradient-to-br from-[hsl(152,60%,42%)] to-[hsl(152,60%,34%)] text-accent-foreground",
        medium: "bg-gradient-to-br from-[hsl(38,92%,50%)] to-[hsl(38,92%,42%)] text-accent-foreground",
        low: "bg-gradient-to-br from-[hsl(0,72%,51%)] to-[hsl(0,72%,43%)] text-accent-foreground",
      },
    },
    defaultVariants: {
      size: "md",
      level: "high",
    },
  }
);

function getScoreLevel(score: number): "high" | "medium" | "low" {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

interface ScoreBadgeProps extends VariantProps<typeof scoreVariants> {
  score: number;
  className?: string;
}

export function ScoreBadge({ score, size, className }: ScoreBadgeProps) {
  const level = getScoreLevel(score);
  return (
    <div className={cn(scoreVariants({ size, level }), className)}>
      {score}
    </div>
  );
}

interface ScoreBarProps {
  score: number;
  label: string;
  className?: string;
}

export function ScoreBar({ score, label, className }: ScoreBarProps) {
  const level = getScoreLevel(score);
  const gradientClass = level === "high"
    ? "bg-gradient-to-r from-[hsl(152,60%,42%)] to-[hsl(152,70%,50%)]"
    : level === "medium"
    ? "bg-gradient-to-r from-[hsl(38,92%,50%)] to-[hsl(38,95%,58%)]"
    : "bg-gradient-to-r from-[hsl(0,72%,51%)] to-[hsl(0,80%,58%)]";

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className={cn("text-sm font-bold tabular-nums", level === "high" ? "score-high" : level === "medium" ? "score-medium" : "score-low")}>
          {score}%
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-1000 ease-out", gradientClass)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export { getScoreLevel };
