import { cn } from "@/lib/utils"

interface PuffPassLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  showText?: boolean
}

export function PuffPassLogo({ size = "md", className, showText = true }: PuffPassLogoProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
    xl: "h-16",
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img src="/images/puff-pass-logo.png" alt="Puff Pass" className={cn("w-auto", sizeClasses[size])} />
      {showText && (
        <div>
          <h1
            className={cn(
              "font-bold",
              size === "sm" && "text-base",
              size === "md" && "text-lg",
              size === "lg" && "text-xl",
              size === "xl" && "text-2xl",
            )}
          >
            Puff Pass
          </h1>
        </div>
      )}
    </div>
  )
}
