import { BoxSwitch } from "components/BoxSwitch/BoxSwitch"
import { Button } from "components/Button/Button"
import { Input } from "components/Input/Input"
import { Modal } from "components/Modal/Modal"
import { Slider } from "components/Slider/Slider"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { OmnipoolPool } from "sections/pools/PoolsPage.utils"
import { FormValues } from "utils/helpers"
import { RemoveLiquidityReward } from "./components/RemoveLiquidityReward"
import { SSlippage, STradingPairContainer } from "./RemoveLiquidity.styled"

type RemoveLiquidityProps = {
  isOpen: boolean
  onClose: () => void
  pool: OmnipoolPool
}

type RemoveLiquidityInputProps = {
  value: number
  onChange: (value: number) => void
}

const options = [
  { label: "25%", value: 25 },
  { label: "50%", value: 50 },
  { label: "75%", value: 75 },
  { label: "MAX", value: 100 },
]

const RemoveLiquidityInput = ({
  value,
  onChange,
}: RemoveLiquidityInputProps) => {
  const [input, setInput] = useState("")

  const { t } = useTranslation()

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
      <Text fs={32} font="FontOver" sx={{ mt: 24 }}>
        1200
      </Text>
      <Text fs={18} font="FontOver" color="pink500" sx={{ mb: 20 }}>
        {t("value.percentage", { value })}
      </Text>
      <Slider
        value={[value]}
        onChange={([val]) => onSelect(val)}
        min={0}
        max={100}
        step={1}
      />

      <SSlippage>
        <BoxSwitch options={options} selected={value} onSelect={onSelect} />
        <Input
          value={input}
          onChange={handleOnChange}
          name="custom"
          label="Custom"
          placeholder="Custom"
        />
        <div
          sx={{ flex: "row", justify: "end", gap: 4, mt: 9 }}
          css={{ gridColumn: "span 2" }}
        >
          <Text fs={11} css={{ opacity: 0.7 }}>
            {t("balance")}
          </Text>
          <Text fs={11}>TODO</Text>
        </div>
      </SSlippage>
    </>
  )
}

export const RemoveLiquidity = ({
  isOpen,
  onClose,
  pool,
}: RemoveLiquidityProps) => {
  const { t } = useTranslation()
  const form = useForm<{ value: number }>({ defaultValues: { value: 25 } })

  const handleSubmit = async (values: FormValues<typeof form>) => {
    console.log(values)
  }
  return (
    <Modal
      open={isOpen}
      title={t("pools.removeLiquidity.modal.title")}
      onClose={onClose}
    >
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        sx={{
          flex: "column",
          justify: "space-between",
          height: "calc(100% - var(--modal-header-title-height))",
        }}
      >
        <div>
          <Controller
            name="value"
            control={form.control}
            render={({ field }) => (
              <RemoveLiquidityInput
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <STradingPairContainer>
            <Text color="brightBlue300">
              {t("pools.removeLiquidity.modal.receive")}
            </Text>

            <RemoveLiquidityReward
              name="Token"
              symbol={pool.symbol}
              amount={t("value", {
                value: 1,
                fixedPointScale: 12,
                type: "token",
              })}
            />
            <RemoveLiquidityReward
              name="Token"
              symbol={pool.symbol}
              amount={t("value", {
                value: 1,
                fixedPointScale: 12,
                type: "token",
              })}
            />
          </STradingPairContainer>

          <div
            sx={{
              flex: "row",
              justify: "space-between",
              mt: 12,
              mb: 45,
              mx: 20,
            }}
          >
            <Text color="darkBlue300" fs={14}>
              {t("pools.pool.liquidity.poolFees")}
            </Text>
            <Text fs={14} color="graySoft">
              TODO
            </Text>
          </div>
        </div>
        <Button variant="primary">
          {t("pools.removeLiquidity.modal.confirm")}
        </Button>
      </form>
    </Modal>
  )
}
