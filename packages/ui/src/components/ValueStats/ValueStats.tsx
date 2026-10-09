import { ResponsiveStyleValue } from "@theme-ui/css"
import {
  Children,
  ComponentProps,
  FC,
  ReactNode,
  useLayoutEffect,
  useRef,
} from "react"

import {
  SValueStats,
  SValueStatsBottomValue,
  SValueStatsGroup,
  SValueStatsLabel,
  SValueStatsValue,
  SValueStatsValueContainer,
  ValueStatsAlign,
  ValueStatsFont,
  ValueStatsSize,
} from "@/components/ValueStats/ValueStats.styled"
import { useResponsiveValue } from "@/styles/media"

import { Skeleton } from "../Skeleton"

export const ValueStatsLabel = SValueStatsLabel
export const ValueStatsValue = SValueStatsValue
export const ValueStatsBottomValue = SValueStatsBottomValue

export type ValueStatsProps = {
  readonly font?: ValueStatsFont
  readonly wrap?: ResponsiveStyleValue<boolean>
  readonly size?: ValueStatsSize
  readonly label?: string
  readonly customLabel?: ReactNode
  readonly value?: string
  readonly customValue?: ReactNode
  readonly bottomLabel?: string
  readonly customBottomLabel?: ReactNode
  readonly floatingBottomLabel?: boolean
  readonly align?: ValueStatsAlign
  readonly isLoading?: boolean
  readonly className?: string
  readonly containerClassName?: string
}

export const ValueStats: FC<ValueStatsProps> = ({
  font = "primary",
  wrap,
  size,
  label,
  customLabel,
  value,
  customValue,
  bottomLabel,
  customBottomLabel,
  floatingBottomLabel,
  align = "left",
  isLoading,
  className,
  containerClassName,
}) => {
  const shouldWrap = useResponsiveValue(wrap, false)

  const renderBottomValues = () => {
    if (isLoading && (bottomLabel || customBottomLabel)) {
      return (
        <SValueStatsBottomValue isFloating={floatingBottomLabel} align={align}>
          <Skeleton width={120} height="100%" />
        </SValueStatsBottomValue>
      )
    }

    if (customBottomLabel) {
      return customBottomLabel
    }

    if (bottomLabel) {
      return (
        <SValueStatsBottomValue isFloating={floatingBottomLabel} align={align}>
          {bottomLabel}
        </SValueStatsBottomValue>
      )
    }

    return null
  }

  return (
    <SValueStats
      shouldWrap={shouldWrap}
      size={size}
      align={align}
      className={className}
    >
      {customLabel ?? <SValueStatsLabel>{label}</SValueStatsLabel>}
      <SValueStatsValueContainer size={size} className={containerClassName}>
        {isLoading ? (
          <SValueStatsValue font={font} size={size}>
            <Skeleton width={120} height="100%" />
          </SValueStatsValue>
        ) : (
          (customValue ?? (
            <SValueStatsValue font={font} size={size}>
              {value}
            </SValueStatsValue>
          ))
        )}

        {renderBottomValues()}
      </SValueStatsValueContainer>
    </SValueStats>
  )
}

export type ValueStatsGroupProps = ComponentProps<typeof SValueStatsGroup>

export const ValueStatsGroup: FC<ValueStatsGroupProps> = ({
  children,
  fullWidth,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const cells = Children.toArray(children)

  // CSS can't balance wrapped lines, so pick the fewest rows whose evenly
  // split columns fit (remainder lands on the top rows, 6 -> 3+3, 7 -> 4+3).
  // Stats are nowrap and measured inside their cells, so the column count
  // doesn't feed back into the widths.
  useLayoutEffect(() => {
    const group = ref.current
    if (!group) return

    const stats = Array.from(group.children).flatMap(
      (cell) => cell.firstElementChild ?? [],
    )

    const layout = () => {
      const available = group.getBoundingClientRect().width
      const gap = parseFloat(getComputedStyle(group).columnGap) || 0
      const widths = stats.map((stat) => stat.getBoundingClientRect().width)

      let columns = 1
      for (let rows = 1; rows <= widths.length; rows++) {
        const cols = Math.ceil(widths.length / rows)
        const needed = Array.from({ length: cols }, (_, col) =>
          Math.max(...widths.filter((_, i) => i % cols === col)),
        ).reduce((sum, width) => sum + width + gap, -gap)

        if (needed <= available) {
          columns = cols
          break
        }
      }

      group.style.setProperty("--columns", String(columns))
      group.toggleAttribute("data-wrapped", columns < widths.length)
    }

    const observer = new ResizeObserver(layout)
    observer.observe(group)
    stats.forEach((stat) => observer.observe(stat))

    return () => observer.disconnect()
  }, [cells.length])

  return (
    <SValueStatsGroup ref={ref} fullWidth={fullWidth} {...props}>
      {cells.map((child, i) => (
        <div key={i}>{child}</div>
      ))}
    </SValueStatsGroup>
  )
}
