import { Anchor, Portal, Root } from "@radix-ui/react-popover"
import {
  createContext,
  FC,
  KeyboardEvent,
  ReactNode,
  useContext,
  useId,
  useRef,
  useState,
} from "react"

import { SContent, SOption } from "./InputSuggestions.styled"

type InputSuggestionsContextValue = {
  activeId: string | undefined
  setActiveId: (id: string) => void
  close: () => void
}

const InputSuggestionsContext =
  createContext<InputSuggestionsContextValue | null>(null)

export type InputSuggestionsInputProps = {
  role: "combobox"
  "aria-expanded": boolean
  "aria-controls": string
  "aria-activedescendant": string | undefined
}

export type InputSuggestionsProps = {
  /** Renders the element the list hangs under; spread the props onto its input. */
  anchor: (inputProps: InputSuggestionsInputProps) => ReactNode
  /** The options, as `InputSuggestionsOption` elements. */
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const isComboboxInput = (target: EventTarget) =>
  target instanceof HTMLElement && target.role === "combobox"

export const InputSuggestions: FC<InputSuggestionsProps> = ({
  anchor,
  children,
  open: controlledOpen,
  onOpenChange,
}) => {
  const listId = useId()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [activeId, setActiveId] = useState<string>()
  const anchorRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = (next: boolean) => {
    if (!next) setActiveId(undefined)
    setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (!isComboboxInput(event.target)) return

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      if (!open) return setOpen(true)

      const options = Array.from(
        listRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [],
      )
      const index = options.findIndex((option) => option.id === activeId)
      const step = event.key === "ArrowDown" ? 1 : -1
      const next =
        index === -1
          ? options.at(step === 1 ? 0 : -1)
          : options[(index + step + options.length) % options.length]

      if (!next) return
      setActiveId(next.id)
      next.scrollIntoView({ block: "nearest" })
    }

    if (event.key === "Enter" && open && activeId) {
      event.preventDefault()
      document.getElementById(activeId)?.click()
    }
  }

  return (
    <Root open={open} onOpenChange={setOpen}>
      <Anchor asChild>
        <div
          ref={anchorRef}
          onFocus={(event) => isComboboxInput(event.target) && setOpen(true)}
          onClick={(event) => isComboboxInput(event.target) && setOpen(true)}
          onBlur={(event) => isComboboxInput(event.target) && setOpen(false)}
          onKeyDown={onKeyDown}
        >
          {anchor({
            role: "combobox",
            "aria-expanded": open,
            "aria-controls": listId,
            "aria-activedescendant": activeId,
          })}
        </div>
      </Anchor>
      <Portal>
        <SContent
          ref={listRef}
          id={listId}
          role="listbox"
          align="start"
          sideOffset={8}
          // Focus stays in the input, the active option is tracked by id
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onMouseDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            if (anchorRef.current?.contains(event.target as Node)) {
              event.preventDefault()
            }
          }}
        >
          <InputSuggestionsContext.Provider
            value={{ activeId, setActiveId, close: () => setOpen(false) }}
          >
            {children}
          </InputSuggestionsContext.Provider>
        </SContent>
      </Portal>
    </Root>
  )
}

export type InputSuggestionsOptionProps = {
  onSelect: () => void
  children: ReactNode
  className?: string
}

export const InputSuggestionsOption: FC<InputSuggestionsOptionProps> = ({
  onSelect,
  children,
  className,
}) => {
  const id = useId()
  const context = useContext(InputSuggestionsContext)

  if (!context) {
    throw new Error("InputSuggestionsOption must be inside InputSuggestions")
  }

  const { activeId, setActiveId, close } = context

  return (
    <SOption
      id={id}
      role="option"
      aria-selected={activeId === id}
      className={className}
      onPointerMove={() => activeId !== id && setActiveId(id)}
      onClick={() => {
        close()
        onSelect()
      }}
    >
      {children}
    </SOption>
  )
}
