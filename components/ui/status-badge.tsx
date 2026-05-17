import * as React from "react"
import { Badge, badgeVariants } from "@/components/ui/badge"
import { type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Extend badgeVariants for status-specific styles
const statusBadgeVariants = (variant: 'published' | 'draft' | 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link') => {
  if (variant === 'published') return "bg-green-600 text-white hover:bg-green-700"
  if (variant === 'draft') return "bg-gray-500 text-white hover:bg-gray-600"
  return ""
}

export interface StatusBadgeProps
  extends React.ComponentProps<typeof Badge> {}

function StatusBadge({ className, variant, ...props }: StatusBadgeProps) {
  const statusStyles = statusBadgeVariants(variant as any)
  return (
    <Badge 
      className={cn(statusStyles, className)} 
      variant={variant === 'published' || variant === 'draft' ? 'default' : variant} 
      {...props} 
    />
  )
}

export { StatusBadge }
