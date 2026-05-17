import type * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusVariant =
  | "published"
  | "draft"
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link";

// Extend badgeVariants for status-specific styles
const getStatusStyles = (variant?: string) => {
  if (variant === "published")
    return "bg-green-600 text-white hover:bg-green-700";
  if (variant === "draft") return "bg-gray-500 text-white hover:bg-gray-600";
  return "";
};

type StatusBadgeProps = React.ComponentProps<typeof Badge>;

function StatusBadge({ className, variant, ...props }: StatusBadgeProps) {
  const statusStyles = getStatusStyles(variant as string | undefined);
  return (
    <Badge
      className={cn(statusStyles, className)}
      variant={
        variant === "published" || variant === "draft" ? "default" : variant
      }
      {...props}
    />
  );
}

export { StatusBadge };
