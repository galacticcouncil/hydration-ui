import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import * as React from "react"
import { SToggleItem, SContainer } from "./ToggleGroup.styled"

export type ItemVariant = "primary" | "secondary"
export type ItemSize = "small" | "medium" | "large"

type ContextProps = {
  variant?: ItemVariant
  size?: ItemSize
}

type ToggleGroupRef = React.ElementRef<typeof ToggleGroupPrimitive.Root>
type RootProps = React.ComponentPropsWithoutRef<
  typeof ToggleGroupPrimitive.Root
>
type CustomRootProps = ContextProps & {
  deselectable?: boolean
  onValueChange?: (value: string | string[]) => void
}

type ToggleGroupProps = RootProps & CustomRootProps

const ToggleGroupContext = React.createContext<ContextProps>({
  variant: "primary",
  size: "medium",
})

const ToggleGroup = React.forwardRef<ToggleGroupRef, ToggleGroupProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "medium",
      deselectable = false,
      onValueChange,
      ...props
    },
    ref,
  ) => {
    const handleValueChange = (value: string | string[]) => {
      if (deselectable) return onValueChange?.(value)
      if (Array.isArray(value) && value.length === 0) return
      if (typeof value === "string" && value === "") return
      onValueChange?.(value)
    }

    return (
      <ToggleGroupPrimitive.Root
        ref={ref}
        className={className}
        asChild
        onValueChange={handleValueChange}
        {...props}
      >
        <SContainer>
          <ToggleGroupContext.Provider value={{ variant, size }}>
            {children}
          </ToggleGroupContext.Provider>
        </SContainer>
      </ToggleGroupPrimitive.Root>
    )
  },
)

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SToggleItem>
>(({ className, children, variant, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)

  return (
    <SToggleItem
      ref={ref}
      variant={context.variant}
      size={context.size}
      className={className}
      {...props}
    >
      {children}
    </SToggleItem>
  )
})

export { ToggleGroup, ToggleGroupItem }
