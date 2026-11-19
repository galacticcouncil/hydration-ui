import { Fragment } from "@galacticcouncil/ui/jsx/jsx-runtime"
import { Range } from "@radix-ui/react-slider"
import { useMemo } from "react"
import { FC } from "react"
import { useMeasure } from "react-use"

import { Union } from "@/assets/icons"
import { getToken } from "@/utils"

import { Box } from "../Box"
import { Icon } from "../Icon/Icon"
import {
  SDash,
  SMark,
  SMarkLabel,
  SMarks,
  SMarkTick,
  SRange,
  SRoot,
  SThumb,
  STrack,
} from "./Slider.styled"

export type SliderMark = {
  value: number
  label?: string
}

export type SliderProps = {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  disabled?: boolean
  dashCount?: number
  marks?: SliderMark[]
}

export const Slider: FC<SliderProps> = ({
  min,
  max,
  step,
  value,
  onChange,
  disabled,
  dashCount = 20,
  marks,
}) => {
  const [ref, { width }] = useMeasure<HTMLSpanElement>()

  const dashes = useMemo(
    () =>
      marks
        ? null
        : Array.from({ length: dashCount + 1 }).map((_, i) => (
            <Fragment key={i}>
              <SDash
                key={`top-${i}`}
                offset={i * (width / dashCount)}
                row="top"
              />
              <SDash
                key={`bottom-${i}`}
                offset={i * (width / dashCount)}
                row="bottom"
              />
            </Fragment>
          )),
    [marks, width, dashCount],
  )

  const slider = (
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
          color={getToken("controls.solid.onAccent")}
        />
      </SThumb>
    </SRoot>
  )

  if (!marks) {
    return slider
  }

  const range = max - min

  return (
    <Box width="100%">
      {slider}
      <SMarks>
        {marks.map(({ value, label }) => {
          const position = range > 0 ? ((value - min) / range) * 100 : 0

          return (
            <SMark key={value} position={position}>
              <SMarkTick labelled={!!label} />
              {label && (
                <SMarkLabel
                  align={
                    position <= 0 ? "start" : position >= 100 ? "end" : "center"
                  }
                >
                  {label}
                </SMarkLabel>
              )}
            </SMark>
          )
        })}
      </SMarks>
    </Box>
  )
}
