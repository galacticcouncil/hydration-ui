import { describe, expect, it } from "vitest"

import { getLeverageMarks } from "@/modules/strategies/multiply/utils/marks"

const format = (value: number) => `${value}x`
const labels = (min: number, max: number) =>
  getLeverageMarks(min, max, format).flatMap((mark) =>
    mark.label ? [mark.value] : [],
  )
const values = (min: number, max: number) =>
  getLeverageMarks(min, max, format).map((mark) => mark.value)

describe("getLeverageMarks", () => {
  it("labels min, the integers between and max", () => {
    expect(labels(1.1, 5)).toEqual([1.1, 2, 3, 4, 5])
    expect(values(1.1, 5)).toEqual([
      1.1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.6, 2.8, 3, 3.2, 3.4, 3.6, 3.8, 4,
      4.2, 4.4, 4.6, 4.8, 5,
    ])
  })

  it("keeps an integer close to max as an unlabelled tick", () => {
    const marks = getLeverageMarks(1.1, 6.4, format)
    expect(marks.find((mark) => mark.value === 6)).toEqual({ value: 6 })
    expect(marks.at(-1)).toEqual({ value: 6.4, label: "6.4x" })
    expect(labels(1.1, 6.4)).toEqual([1.1, 2, 3, 4, 5, 6.4])
  })

  it("labels only the ends of a narrow range", () => {
    expect(labels(1.1, 1.3)).toEqual([1.1, 1.3])
    expect(values(1.1, 1.3)).toEqual([1.1, 1.2, 1.3])
  })

  it("has no duplicate values", () => {
    const ranges: [number, number][] = [
      [1.1, 5],
      [1, 4],
      [1.2, 3.6],
      [1.1, 4.37],
    ]
    for (const [min, max] of ranges) {
      const all = values(min, max)
      expect(new Set(all).size).toBe(all.length)
    }
  })
})
