import { Select } from "@galacticcouncil/ui/components"
import * as React from "react"

import { EmodeCategory } from "@/helpers/types"

import { getEmodeMessage } from "./emode.utils"

export type EmodeSelectProps = {
  emodeCategories: Record<number, EmodeCategory>
  selectedEmode: number | undefined
  setSelectedEmode: React.Dispatch<
    React.SetStateAction<EmodeCategory | undefined>
  >
  userEmode: number
}

export const EmodeSelect = ({
  emodeCategories,
  selectedEmode,
  setSelectedEmode,
  userEmode,
}: EmodeSelectProps) => {
  return (
    <Select
      value={selectedEmode?.toString()}
      onValueChange={(key) => {
        setSelectedEmode(emodeCategories[Number(key)])
      }}
      items={Object.keys(emodeCategories)
        .filter(
          (categoryKey) =>
            userEmode !== Number(categoryKey) && Number(categoryKey) !== 0,
        )
        .map((categoryKey) => ({
          key: categoryKey,
          label: getEmodeMessage(emodeCategories[Number(categoryKey)].label),
        }))}
    />
  )
}
