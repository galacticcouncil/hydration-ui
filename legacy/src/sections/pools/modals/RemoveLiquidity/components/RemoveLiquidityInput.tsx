import { BoxSwitch } from "components/BoxSwitch/BoxSwitch"
import { Input } from "components/Input/Input"
import { Slider } from "components/Slider/Slider"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { SSlippage } from "sections/pools/modals/RemoveLiquidity/RemoveLiquidity.styled"

type RemoveLiquidityInputProps = {
  value: number
  onChange: (value: number) => void
  balance: string
  disabled?: boolean
}

const options = [
  { label: "25%", value: 25 },
  { label: "50%", value: 50 },
  { label: "75%", value: 75 },
  { label: "MAX", value: 100 },
]

export const RemoveLiquidityInput = ({
  value,
  onChange,
  balance,
  disabled,
}: RemoveLiquidityInputProps) => {
  const { t } = useTranslation()
  const [input, setInput] = useState("")

  const handleOnChange = (value: string) => {
    setInput(value)

    const parsedValue = Number.parseFloat(value)
    if (!Number.isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 100) {
      onChange(parsedValue)
    }
  }

  const onSelect = (value: number) => {
    setInput("")
    onChange(value)
  }

  return (
    <>
      <Slider
        value={[value]}
        onChange={([val]) => onSelect(val)}
        min={0}
        max={100}
        step={1}
        disabled={disabled}
      />

      <SSlippage>
        <BoxSwitch
          options={options}
          selected={value}
          onSelect={onSelect}
          disabled={disabled}
        />
        <Input
          disabled={!!disabled}
          value={input}
          onChange={handleOnChange}
          name="custom"
          label={t("custom")}
          placeholder={t("custom")}
          unit="%"
        />
        <div
          sx={{ flex: "row", justify: "end", gap: 4, mt: 9 }}
          css={{ gridColumn: "span 2" }}
        >
          <Text fs={11} css={{ opacity: 0.7 }}>
            {t("balance")}
          </Text>
          <Text fs={11}>{balance}</Text>
        </div>
      </SSlippage>
    </>
  )
}
