import { FC, Fragment, useLayoutEffect, useMemo, useRef, useState } from "react"
import {
  StyledDash,
  StyledRange,
  StyledRoot,
  StyledThumb,
  StyledTrack,
} from "components/Slider/Slider.styled"

const dashCount = 20

type Props = {
  value: number[]
  onChange: (value: number[]) => void
  min: number
  max: number
  step: number
  disabled?: boolean
}

export const Slider: FC<Props> = ({
  min,
  max,
  step,
  value,
  onChange,
  disabled,
}) => {
  const [rootWidth, setRootWidth] = useState(0)
  const rootRef = useRef<HTMLSpanElement>(null)

  const dashes = useMemo(
    () =>
      Array.from({ length: dashCount + 1 }).map((_, i) => (
        <Fragment key={i}>
          <StyledDash
            key={`top-${i}`}
            offset={i * (rootWidth / dashCount)}
            row="top"
          />
          <StyledDash
            key={`bottom-${i}`}
            offset={i * (rootWidth / dashCount)}
            row="bottom"
          />
        </Fragment>
      )),
    [rootWidth],
  )

  useLayoutEffect(() => {
    if (rootRef.current) setRootWidth(rootRef.current.offsetWidth)
  }, [])

  return (
    <StyledRoot
      value={value}
      onValueChange={onChange}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      ref={rootRef}
    >
      {dashes}
      <StyledTrack>
        <StyledRange />
      </StyledTrack>
      <StyledThumb />
    </StyledRoot>
  )
}
