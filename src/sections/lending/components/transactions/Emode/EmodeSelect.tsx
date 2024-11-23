import ChevronDown from "assets/icons/ChevronDown.svg?react"
import { ButtonTransparent } from "components/Button/Button"
import { Dropdown } from "components/Dropdown/Dropdown"
import { Text } from "components/Typography/Text/Text"
import * as React from "react"
import { EmodeCategory } from "sections/lending/helpers/types"
import { getEmodeMessage } from "./EmodeNaming"

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
    <div sx={{ flex: "row", align: "center", justify: "space-between" }}>
      <Text fs={14} color="basic400">
        Asset category
      </Text>
      <Dropdown
        asChild
        onSelect={({ key }) => {
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
      >
        <ButtonTransparent>
          <Text sx={{ flex: "row", align: "center", color: "brightBlue300" }}>
            {selectedEmode !== 0 ? (
              <span>
                {getEmodeMessage(emodeCategories[Number(selectedEmode)].label)}
              </span>
            ) : (
              <span>Select</span>
            )}
            <ChevronDown width={24} height={24} />
          </Text>
        </ButtonTransparent>
      </Dropdown>
    </div>
  )
}
