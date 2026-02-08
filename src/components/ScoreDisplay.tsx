import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const scoreVariants = cva(
  "inline-flex items-center justify-center rounded-full font-display font-bold",
  {
    variants: {
      size: {
        sm: "h-10 w-10 text-sm",
        md: "h-14 w-14 text-lg",
        lg: "h-20 w-20 text-2xl",
        xl: "h-28 w-28 text-3xl",
      },
      level: {
        high: "bg-score-high text-accent-foreground",
        medium: "bg-score-medium text-accent-foreground",
        low: "bg-score-low text-accent-foreground",
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
  const colorClass = level === "high" ? "bg-score-high" : level === "medium" ? "bg-score-medium" : "bg-score-low";

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className={cn("text-sm font-bold", level === "high" ? "score-high" : level === "medium" ? "score-medium" : "score-low")}>
          {score}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all duration-1000 ease-out", colorClass)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export { getScoreLevel };
