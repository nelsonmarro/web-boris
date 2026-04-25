import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-primary via-primary to-orange-600 text-white shadow-[0_4px_20px_rgba(255,115,0,0.3)] hover:shadow-[0_0_30px_rgba(255,115,0,0.5)] border-t border-white/20",
        destructive:
          "bg-gradient-to-br from-red-600 to-red-800 text-white shadow-[0_4px_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]",
        outline:
          "border border-white/20 bg-white/5 backdrop-blur-xl text-white hover:bg-white/10 hover:border-white/40 shadow-[0_4px_15px_rgba(0,0,0,0.2)]",
        secondary:
          "bg-white/10 text-white hover:bg-white/20 backdrop-blur-xl border border-white/10",
        ghost: "text-white/80 hover:bg-white/10 hover:text-white transition-colors",
        link: "text-primary underline-offset-4 hover:underline",
        liquid: "glass-liquid text-white hover:bg-white/10 border-white/20"
      },
      size: {
        default: "h-12 px-8 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {props.children}
      </span>
    </Comp>
  )
}

export { Button, buttonVariants }
