import * as React from "react"

import {
  SToggleGroup,
  SToggleGroupItem,
  ToggleGroupProps,
  ToggleGroupSize,
} from "./ToggleGroup.styled"

const ToggleGroupContext = React.createContext<
  ToggleGroupProps & {
    spacing?: number
  }
>({
  size: "medium",
})

type ToggleGroupCommonProps = ToggleGroupProps & {
  children: React.ReactNode
  disabled?: boolean
}

export type ToggleGroupSingleProps<T extends string> =
  ToggleGroupCommonProps & {
    type: "single"
    value?: T
    defaultValue?: T
    onValueChange?: (value: T) => void
  }

export type ToggleGroupMultipleProps<T> = ToggleGroupCommonProps & {
  type: "multiple"
  value?: T[]
  defaultValue?: T[]
  onValueChange?: (value: T[]) => void
}

export type ToggleGroupRootProps<T extends string> =
  | ToggleGroupSingleProps<T>
  | ToggleGroupMultipleProps<T>

function ToggleGroup<T extends string>({
  size = "medium",
  children,
  ...props
}: ToggleGroupRootProps<T>) {
  return (
    <ToggleGroupContext.Provider value={{ size }}>
      <SToggleGroup {...props}>{children}</SToggleGroup>
    </ToggleGroupContext.Provider>
  )
}

type ToggleGroupItemProps = React.ComponentProps<typeof SToggleGroupItem> & {
  size?: ToggleGroupSize
}

function ToggleGroupItem({ children, size, ...props }: ToggleGroupItemProps) {
  const context = React.useContext(ToggleGroupContext)
  return (
    <SToggleGroupItem size={size ?? context.size} {...props}>
      {children}
    </SToggleGroupItem>
  )
}

export { ToggleGroup, ToggleGroupItem }
