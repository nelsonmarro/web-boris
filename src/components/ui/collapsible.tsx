"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

function Collapsible({ render, ...props }: CollapsiblePrimitive.Root.Props & { render?: React.ReactElement }) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" render={render} {...props} />
}

function CollapsibleTrigger({ render, ...props }: CollapsiblePrimitive.Trigger.Props & { render?: React.ReactElement }) {
  return (
    <CollapsiblePrimitive.Trigger 
      data-slot="collapsible-trigger"
      render={render}
      {...props} 
    />
  )
}

function CollapsibleContent({ ...props }: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
