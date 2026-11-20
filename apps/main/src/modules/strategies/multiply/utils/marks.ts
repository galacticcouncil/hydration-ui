import { type SliderMark } from "@galacticcouncil/ui/components"

// hundredths keep the 0.2 and integer steps exact
const UNITS = 100
const MINOR_STEP = 20
const LABEL_CLEARANCE = 40

/**
 * Slider marks for a leverage range: labelled min, integers and max, with
 * minor ticks every 0.2. Integers too close to an end lose their label.
 */
export const getLeverageMarks = (
  min: number,
  max: number,
  format: (value: number) => string,
): SliderMark[] => {
  const lo = Math.round(min * UNITS)
  const hi = Math.round(max * UNITS)
  if (hi <= lo) return [{ value: min, label: format(min) }]

  const marks: SliderMark[] = [{ value: min, label: format(min) }]
  for (
    let unit = Math.floor(lo / MINOR_STEP + 1) * MINOR_STEP;
    unit < hi;
    unit += MINOR_STEP
  ) {
    const value = unit / UNITS
    const isLabelled =
      unit % UNITS === 0 &&
      unit - lo > LABEL_CLEARANCE &&
      hi - unit > LABEL_CLEARANCE
    marks.push(isLabelled ? { value, label: format(value) } : { value })
  }
  marks.push({ value: max, label: format(max) })

  return marks
}
