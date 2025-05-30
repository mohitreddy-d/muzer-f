import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-base outline-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "placeholder:text-zinc-500 dark:placeholder:text-zinc-400",
        "focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
        "dark:border-zinc-800 dark:focus:border-red-400",
        className
      )}
      {...props}
    />
  )
}

export { Input }
