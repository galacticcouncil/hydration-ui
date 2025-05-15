import { Fragment } from "@galacticcouncil/ui/jsx/jsx-runtime"
import { Range } from "@radix-ui/react-slider"
import { useLayoutEffect, useMemo, useRef } from "react"
import { useState } from "react"
import { FC } from "react"

import { Union } from "@/assets/icons"
import { getToken } from "@/utils"

import { Icon } from "../Icon/Icon"
import { SDash, SRange, SRoot, SThumb, STrack } from "./Slider.styled"

export type SliderProps = {
  value: number[]
  onChange: (value: number[]) => void
  min: number
  max: number
  step: number
  disabled?: boolean
}

const dashCount = 20

export const Slider: FC<SliderProps> = ({
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
          <SDash
            key={`top-${i}`}
            offset={i * (rootWidth / dashCount)}
            row="top"
          />
          <SDash
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
    <SRoot
      value={value}
      onValueChange={onChange}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      ref={rootRef}
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
