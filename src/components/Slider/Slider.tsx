import {
  FC,
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { Range } from "@radix-ui/react-slider"
import {
  SDash,
  SDashLabel,
  SRange,
  SRoot,
  SThumb,
  STrack,
} from "components/Slider/Slider.styled"
import { theme } from "theme"

export type GradientKey = keyof typeof theme.gradients
export type ColorKey = keyof typeof theme.colors

type ThumbSize = "small" | "medium" | "large"

export type SliderProps = {
  value: number[]
  onChange: (value: number[]) => void
  min: number
  max: number
  step: number
  disabled?: boolean
  color?: GradientKey | ColorKey
  dashes?: "auto" | number
  thumbSize?: "small" | "medium"
  formatDashValue?: (value: number) => string
}

const thumbSizeMap: Record<ThumbSize, number> = {
  small: 24,
  medium: 40,
  large: 52,
}

export const Slider: FC<SliderProps> = ({
  min,
  max,
  step,
  value,
  onChange,
  disabled,
  color = "brightBlue600",
  dashes = 20,
  thumbSize = "medium",
  formatDashValue,
}) => {
  const [rootWidth, setRootWidth] = useState(0)
  const rootRef = useRef<HTMLSpanElement>(null)

  const dashCount = dashes === "auto" ? Math.floor((max - min) / step) : dashes

  const dashFormatter = useRef(formatDashValue)
  useEffect(() => {
    dashFormatter.current = formatDashValue
  }, [formatDashValue])

  const dashContent = useMemo(
    () =>
      Array.from({ length: dashCount + 1 }).map((_, i) => {
        const dashValue = min + i * step
        const offset = i * (rootWidth / dashCount)
        return (
          <Fragment key={i}>
            <SDash key={`top-${i}`} offset={offset} row="top" />
            <SDash key={`bottom-${i}`} offset={offset} row="bottom"></SDash>
            <SDashLabel offset={offset}>
              {dashFormatter.current
                ? dashFormatter.current(dashValue)
                : dashValue}
            </SDashLabel>
          </Fragment>
        )
      }),
    [dashCount, min, rootWidth, step],
  )

  useLayoutEffect(() => {
    if (rootRef.current) setRootWidth(rootRef.current.offsetWidth)
  }, [])

  return (
    <SRoot
      value={value}
      onValueChange={onChange}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      ref={rootRef}
    >
      {dashContent}
      <STrack>
        <Range asChild>
          <SRange color={color} />
        </Range>
      </STrack>
      <SThumb size={thumbSizeMap[thumbSize]} />
    </SRoot>
  )
}
