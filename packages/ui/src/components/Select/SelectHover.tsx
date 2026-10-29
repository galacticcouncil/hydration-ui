import * as Popover from "@radix-ui/react-popover"
import { KeyboardEvent, ReactElement, useEffect, useRef, useState } from "react"

import { BoxProps } from "../Box"
import { Flex } from "../Flex"
import { Icon } from "../Icon"
import { MenuItemLabel, MenuSelectionItem } from "../Menu"
import { ScrollArea } from "../ScrollArea"
import type { SelectItem } from "./Select"
import { SSelectHoverContent } from "./SelectHover.styled"
import { getSelectHoverTarget } from "./SelectHover.utils"
import { SelectSkeleton } from "./SelectSkeleton"

type SelectHoverProps<TKey extends string> = {
  trigger: ReactElement
  items: ReadonlyArray<SelectItem<TKey>>
  value?: TKey
  onValueChange: (value: TKey) => void
  iconSize?: BoxProps["size"]
  disabled?: boolean
  isLoading?: boolean
  onCloseAutoFocus?: (event: Event) => void
}

export const SelectHover = <TKey extends string>({
  trigger,
  items,
  value,
  onValueChange,
  iconSize,
  disabled,
  isLoading = false,
  onCloseAutoFocus,
}: SelectHoverProps<TKey>) => {
  const [open, setOpen] = useState(false)
  const hoverOpen = useRef(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const optionRefs = useRef(new Map<TKey, HTMLButtonElement>())
  const pendingFocus = useRef<"first" | "last">("first")
  const search = useRef({ text: "", time: 0 })
  useEffect(() => () => clearTimeout(closeTimer.current), [])

  const cancelClose = () => clearTimeout(closeTimer.current)
  const closeOnLeave = (event: React.PointerEvent) => {
    if (event.pointerType !== "mouse" || !hoverOpen.current) return
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), 150)
  }
  const pinOpen = () => {
    hoverOpen.current = false
    cancelClose()
  }
  const focusOption = (position: "first" | "last") => {
    const item = position === "first" ? items[0] : items.at(-1)
    if (item) optionRefs.current.get(item.key)?.focus()
  }
  const navigateOptions = (event: KeyboardEvent) => {
    if (isLoading) return
    pinOpen()
    const active = items.find(
      (item) => optionRefs.current.get(item.key) === document.activeElement,
    )
    let query = ""
    if (
      event.key.length === 1 &&
      event.key !== " " &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey
    ) {
      const now = Date.now()
      const text =
        (now - search.current.time < 500 ? search.current.text : "") +
        event.key.toLowerCase()
      search.current = { text, time: now }
      query = text
    }
    const nextKey = getSelectHoverTarget(items, active?.key, event.key, query)
    if (nextKey === undefined) return
    event.preventDefault()
    optionRefs.current.get(nextKey)?.focus()
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        asChild
        disabled={disabled}
        onPointerEnter={(event) => {
          if (disabled || event.pointerType !== "mouse") return
          cancelClose()
          if (!open) {
            hoverOpen.current = true
            setOpen(true)
          }
        }}
        onPointerLeave={closeOnLeave}
        onClick={(event) => {
          event.preventDefault()
          hoverOpen.current = false
          cancelClose()
          setOpen(true)
          if (event.detail === 0 && open) focusOption("first")
        }}
        onKeyDown={(event) => {
          pinOpen()
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault()
            pendingFocus.current = event.key === "ArrowDown" ? "first" : "last"
            if (open) focusOption(pendingFocus.current)
            setOpen(true)
          }
        }}
      >
        {trigger}
      </Popover.Trigger>
      <Popover.Portal>
        <SSelectHoverContent
          sideOffset={6}
          align="start"
          collisionPadding={12}
          onPointerEnter={cancelClose}
          onPointerLeave={closeOnLeave}
          onKeyDown={navigateOptions}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            if (!hoverOpen.current) focusOption(pendingFocus.current)
            pendingFocus.current = "first"
          }}
          onCloseAutoFocus={(event) => {
            onCloseAutoFocus?.(event)
            if (hoverOpen.current) event.preventDefault()
          }}
        >
          <ScrollArea>
            <Flex direction="column" gap="1px">
              {isLoading ? (
                <SelectSkeleton />
              ) : (
                items.map((item) => (
                  <MenuSelectionItem
                    asChild
                    key={item.key}
                    variant="filterLink"
                    aria-pressed={value === item.key}
                    onClick={() => {
                      onValueChange(item.key)
                      setOpen(false)
                    }}
                  >
                    <button
                      type="button"
                      ref={(element) => {
                        if (element) optionRefs.current.set(item.key, element)
                        else optionRefs.current.delete(item.key)
                      }}
                    >
                      <MenuItemLabel>
                        {item.icon && (
                          <Icon size={iconSize ?? "s"} component={item.icon} />
                        )}
                        {item.label}
                      </MenuItemLabel>
                    </button>
                  </MenuSelectionItem>
                ))
              )}
            </Flex>
          </ScrollArea>
        </SSelectHoverContent>
      </Popover.Portal>
    </Popover.Root>
  )
}
