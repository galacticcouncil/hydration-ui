import { ComponentPropsWithRef, useState } from "react"
import { Slider } from "components/Slider/Slider"
import { Text } from "components/Typography/Text/Text"
import BN from "bignumber.js"
import { useTranslation } from "react-i18next"
import { SInputBoxContainer } from "components/Input/Input.styled"
import { useShallowCompareEffect } from "react-use"
import { BN_0 } from "utils/constants"

export type MemepadSupplySliderProps = {
  totalSupply: string
  symbol: string
  onChange: (value: string) => void
} & Omit<ComponentPropsWithRef<typeof Slider>, "onChange" | "value">

const calculateAllocatedSupply = (totalSupply: string, perc: number) => {
  return BN(totalSupply || "0")
    .times(perc)
    .div(100)
    .decimalPlaces(0, BN.ROUND_CEIL)
}

export const MemepadSupplySlider: React.FC<MemepadSupplySliderProps> = ({
  totalSupply,
  symbol,
  onChange,
  ...props
}) => {
  const { t } = useTranslation()
  const [value, setValue] = useState([50])
  const [allocatedSupply, setAllocatedSupply] = useState(BN_0)

  useShallowCompareEffect(() => {
    const allocatedSupply = calculateAllocatedSupply(totalSupply, value[0])

    setAllocatedSupply(allocatedSupply)
    onChange?.(allocatedSupply.toString())
  }, [value, totalSupply])

  return (
    <SInputBoxContainer>
      <Text tTransform="uppercase" fs={11} color="basic500">
        {t("memepad.form.supplyInitial")}
      </Text>
      <Text fs={11} sx={{ my: 10 }}>
        Max {t("value.tokenWithSymbol", { value: totalSupply || "0", symbol })}
      </Text>
      <div sx={{ flex: "row", gap: 10, justify: "space-between" }}>
        <Text fs={17} fw={500} font="GeistSemiBold" color="brightBlue300">
          {value}%
        </Text>
        <Text fs={17} fw={500} font="GeistSemiBold" color="darkBlue200">
          {t("value.tokenWithSymbol", {
            value: !allocatedSupply.isNaN() ? allocatedSupply : BN_0,
            symbol,
          })}
        </Text>
      </div>
      <div sx={{ py: 10 }}>
        <Slider
          {...props}
          value={value}
          onChange={setValue}
          min={1}
          max={100}
          step={1}
          color="pinkLightBlue"
        />
      </div>
    </SInputBoxContainer>
  )
}
