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
  SDashValue,
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

  const thumbSizePx = thumbSizeMap[thumbSize]

  const dashFormatter = useRef(formatDashValue)
  useEffect(() => {
    dashFormatter.current = formatDashValue
  }, [formatDashValue])

  const dashContent = useMemo(() => {
    const count = dashes === "auto" ? Math.floor((max - min) / step) : dashes

    return Array.from({ length: count + 1 }).map((_, i) => {
      const value = min + i * step

      // if dash values are shown, align them at the center of the thumb
      const thumbOffset = withDashValues
        ? calculateThumbOffset(value, min, max, thumbSizePx)
        : 0

      const offset = i * (rootWidth / count) - thumbOffset * -1

      return (
        <Fragment key={i}>
          <SDash key={`top-${i}`} $offset={offset} row="top" />
          <SDash key={`bottom-${i}`} $offset={offset} row="bottom" />
          {withDashValues && (
            <SDashValue $offset={offset}>
              {dashFormatter.current ? dashFormatter.current(value) : value}
            </SDashValue>
          )}
        </Fragment>
      )
    })
  }, [dashes, max, min, rootWidth, step, thumbSizePx, withDashValues])

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

function calculateThumbOffset(
  value: number,
  min: number,
  max: number,
  thumbSize: number,
) {
  const percent = (100 * (value - min)) / (max - min)
  const halfWidth = thumbSize / 2
  const offset = linearScale([0, 50], [0, halfWidth])(percent)
  return halfWidth - offset
}
