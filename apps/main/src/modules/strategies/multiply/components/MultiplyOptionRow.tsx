import { SOptionRow } from "@/modules/strategies/multiply/components/MultiplyOptionRow.styled"

type MultiplyOptionRowProps = {
  selected: boolean
  disabled?: boolean
  onSelect: () => void
  children: React.ReactNode
}

/** A table row picked by click, Enter or Space. */
export const MultiplyOptionRow: React.FC<MultiplyOptionRowProps> = ({
  selected,
  disabled = false,
  onSelect,
  children,
}) => (
  <SOptionRow
    selected={selected}
    isClickable={!disabled}
    tabIndex={disabled ? -1 : 0}
    aria-selected={selected}
    aria-disabled={disabled}
    onClick={disabled ? undefined : onSelect}
    onKeyDown={(e) => {
      if (disabled || (e.key !== "Enter" && e.key !== " ")) return
      e.preventDefault()
      onSelect()
    }}
  >
    {children}
  </SOptionRow>
)
