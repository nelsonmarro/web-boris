import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border border-white/40 bg-white/10 backdrop-blur-xl px-4 py-2 text-base font-medium text-white shadow-[inset_0_2px_6px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.5),0_2px_10px_rgba(0,0,0,0.05)] transition-all duration-300 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-white placeholder:text-white/60 focus-visible:border-white/60 focus-visible:bg-white/20 focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:shadow-[inset_0_2px_6px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.8),0_0_15px_rgba(255,255,255,0.2)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-black/20 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/30 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
