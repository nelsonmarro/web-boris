import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-[100px] w-full rounded-xl border border-white/40 bg-white/10 backdrop-blur-xl px-4 py-3 text-base font-medium text-white shadow-[inset_0_2px_6px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.5),0_2px_10px_rgba(0,0,0,0.05)] transition-all duration-300 outline-none placeholder:text-white/60 focus-visible:border-white/60 focus-visible:bg-white/20 focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:shadow-[inset_0_2px_6px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.8),0_0_15px_rgba(255,255,255,0.2)] disabled:cursor-not-allowed disabled:bg-black/20 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/30 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
