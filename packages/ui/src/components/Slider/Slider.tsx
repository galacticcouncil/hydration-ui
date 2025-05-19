import { Fragment } from "@galacticcouncil/ui/jsx/jsx-runtime"
import { Range } from "@radix-ui/react-slider"
import { useMemo } from "react"
import { FC } from "react"
import { useMeasure } from "react-use"

import { Union } from "@/assets/icons"
import { getToken } from "@/utils"

import { Icon } from "../Icon/Icon"
import { SDash, SRange, SRoot, SThumb, STrack } from "./Slider.styled"

export type SliderProps = {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  disabled?: boolean
  dashCount?: number
}

export const Slider: FC<SliderProps> = ({
  min,
  max,
  step,
  value,
  onChange,
  disabled,
  dashCount = 20,
}) => {
  const [ref, { width }] = useMeasure<HTMLSpanElement>()

  const dashes = useMemo(
    () =>
      Array.from({ length: dashCount + 1 }).map((_, i) => (
        <Fragment key={i}>
          <SDash key={`top-${i}`} offset={i * (width / dashCount)} row="top" />
          <SDash
            key={`bottom-${i}`}
            offset={i * (width / dashCount)}
            row="bottom"
          />
        </Fragment>
      )),
    [width, dashCount],
  )

  return (
    <SRoot
      value={[value]}
      onValueChange={(v) => onChange(v[0])}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      ref={ref}
    >
      {dashes}
      <STrack>
        <Range asChild>
          <SRange />
        </Range>
      </STrack>
      <SThumb>
        <Icon
          size={10}
          component={Union}
          color={getToken("controls.outline.active")}
        />
      </SThumb>
    </SRoot>
  )
}
