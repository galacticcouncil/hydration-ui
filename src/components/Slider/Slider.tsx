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
  withDashValues?: boolean
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
  withDashValues = false,
  formatDashValue,
}) => {
  const [rootWidth, setRootWidth] = useState(0)
  const rootRef = useRef<HTMLSpanElement>(null)

  const dashCount = dashes === "auto" ? Math.floor((max - min) / step) : dashes

  const dashFormatter = useRef(formatDashValue)
  useEffect(() => {
    dashFormatter.current = formatDashValue
  }, [formatDashValue])

  const thumbSizePx = thumbSizeMap[thumbSize]

  const dashContent = useMemo(
    () =>
      Array.from({ length: dashCount + 1 }).map((_, i) => {
        const dashValue = min + i * step

        const percent = (100 * (dashValue - min)) / (max - min)
        const thumbOffset = calculateThumbOffset(percent, thumbSizePx)
        const dashOffset = thumbOffset * -1
        const offset = i * (rootWidth / dashCount) - dashOffset

        return (
          <Fragment key={i}>
            <SDash key={`top-${i}`} offset={offset} row="top" />
            <SDash key={`bottom-${i}`} offset={offset} row="bottom"></SDash>
            {withDashValues && (
              <SDashLabel offset={offset}>
                {dashFormatter.current
                  ? dashFormatter.current(dashValue)
                  : dashValue}
              </SDashLabel>
            )}
          </Fragment>
        )
      }),
    [dashCount, max, min, rootWidth, step, thumbSizePx, withDashValues],
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
      <SThumb size={thumbSizePx} />
    </SRoot>
  )
}

function linearScale(input: [number, number], output: [number, number]) {
  return (value: number) => {
    if (input[0] === input[1] || output[0] === output[1]) return output[0]
    const ratio = (output[1] - output[0]) / (input[1] - input[0])
    return output[0] + ratio * (value - input[0])
  }
}

function calculateThumbOffset(percent: number, thumbSize: number) {
  const halfWidth = thumbSize / 2
  const offset = linearScale([0, 50], [0, halfWidth])(percent)
  return halfWidth - offset
}
