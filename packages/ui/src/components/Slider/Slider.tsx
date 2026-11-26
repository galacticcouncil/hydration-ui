import { Range } from "@radix-ui/react-slider"
import { FC } from "react"

import { Union } from "@/assets/icons"
import { getToken } from "@/utils"

import { Box } from "../Box"
import { Icon } from "../Icon/Icon"
import {
  SMark,
  SMarkLabel,
  SMarks,
  SMarkTick,
  SRange,
  SRoot,
  SThumb,
  SThumbHandle,
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
  marks?: SliderMark[]
}

export const Slider: FC<SliderProps> = ({
  min,
  max,
  step,
  value,
  onChange,
  disabled,
  marks,
}) => {
  const slider = (
    <SRoot
      value={[value]}
      onValueChange={(v) => onChange(v[0])}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
    >
      <STrack>
        <Range asChild>
          <SRange />
        </Range>
      </STrack>
      <SThumb>
        <SThumbHandle>
          <Icon
            size={10}
            component={Union}
            color={getToken("controls.solid.onAccent")}
          />
        </SThumbHandle>
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
