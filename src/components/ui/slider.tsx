import * as React from 'react'
import { Root, Track, Range, Thumb } from '@radix-ui/react-slider'

import { cn } from '@/lib/utils'

export const Slider = React.forwardRef<
  React.ElementRef<typeof Root>,
  React.ComponentPropsWithoutRef<typeof Root>
>(({ className, ...props }, ref) => (
  <Root
    ref={ref}
    className={cn('relative flex w-full items-center touch-none select-none', className)}
    {...props}
  >
    <Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-zinc-700">
      <Range className="absolute h-full bg-green-500" />
    </Track>
    <Thumb className="block h-3 w-3 rounded-full border bg-green-500 border-green-500 shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500 disabled:pointer-events-none disabled:opacity-50" />
  </Root>
))
Slider.displayName = 'Slider' 