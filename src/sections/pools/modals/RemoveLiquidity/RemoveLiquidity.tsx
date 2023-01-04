import { BoxSwitch } from "components/BoxSwitch/BoxSwitch"
import { Button } from "components/Button/Button"
import { Input } from "components/Input/Input"
import { Modal } from "components/Modal/Modal"
import { Slider } from "components/Slider/Slider"
import { Text } from "components/Typography/Text/Text"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { FormValues } from "utils/helpers"
import { RemoveLiquidityReward } from "./components/RemoveLiquidityReward"
import { SSlippage, STradingPairContainer } from "./RemoveLiquidity.styled"
import { HydraPositionsTableData } from "../../../wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"

import {
  calculate_liquidity_lrna_out,
  calculate_liquidity_out,
} from "@galacticcouncil/math/build/omnipool/bundler/hydra_dx_wasm"
import { useOmnipoolAssets, useOmnipoolFee } from "../../../../api/omnipool"
import { useTokenBalance } from "../../../../api/balances"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "../../../../utils/api"
import { BN_10 } from "../../../../utils/constants"
import { useAssetMetaList } from "../../../../api/assetMeta"
import { useRemoveLiquidity } from "./RemoveLiquidity.utils"
import { useApiIds } from "../../../../api/consts"

type RemoveLiquidityProps = {
  isOpen: boolean
  onClose: () => void
  position: HydraPositionsTableData
  onSuccess: () => void
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
  onSuccess,
  position,
}: RemoveLiquidityProps) => {
  const { t } = useTranslation()
  const form = useForm<{ value: number }>({ defaultValues: { value: 25 } })

  const { data: omnipoolFee } = useOmnipoolFee()

  const apiIds = useApiIds()
  const metas = useAssetMetaList([apiIds.data?.hubId, position.assetId])

  const meta = metas.data?.find((m) => m.id.toString() === position.assetId)
  const lrnaMeta = metas.data?.find(
    (m) => m.id.toString() === apiIds.data?.hubId,
  )

  const removeLiquidity = useRemoveLiquidity(onSuccess)

  const handleSubmit = async (values: FormValues<typeof form>) => {
    const value = position.shares.div(100).times(values.value)
    await removeLiquidity(position.id, value.toFixed(0))
  }

  const omnipoolAssets = useOmnipoolAssets()
  const omnipoolBalance = useTokenBalance(
    position.assetId,
    OMNIPOOL_ACCOUNT_ADDRESS,
  )

  const omnipoolAsset = omnipoolAssets.data?.find(
    (a) => a.id.toString() === position.assetId,
  )

  const value = form.watch("value")

  const removeSharesValue = useMemo(() => {
    return position.shares.div(100).times(value)
  }, [value, position])

  const removeLiquidityValues = useMemo(() => {
    const positionPrice = position.price.times(BN_10.pow(18))
    if (omnipoolBalance.data && omnipoolAsset?.data) {
      const params: Parameters<typeof calculate_liquidity_out> = [
        omnipoolBalance.data.balance.toString(),
        omnipoolAsset.data.hubReserve.toString(),
        omnipoolAsset.data.shares.toString(),
        position.providedAmount.toString(),
        position.shares.toString(),
        positionPrice.toFixed(0),
        removeSharesValue.toFixed(0),
      ]
      return {
        token: calculate_liquidity_out.apply(this, params),
        lrna: calculate_liquidity_lrna_out.apply(this, params),
      }
    }
  }, [omnipoolBalance, omnipoolAsset, position, removeSharesValue])

  return (
    <Modal
      open={isOpen}
      withoutOutsideClose
      title={t("liquidity.remove.modal.title")}
      onClose={onClose}
    >
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        autoComplete="off"
        sx={{
          flex: "column",
          justify: "space-between",
          height: "calc(100% - var(--modal-header-title-height))",
        }}
      >
        <div>
          <Text fs={32} font="FontOver" sx={{ mt: 24 }}>
            {t("liquidity.remove.modal.value", {
              value: removeSharesValue.div(
                BN_10.pow(meta?.decimals.toNumber() ?? 12),
              ),
            })}
          </Text>
          <Text fs={18} font="FontOver" color="pink500" sx={{ mb: 20 }}>
            {t("value.percentage", { value })}
          </Text>
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
              {t("liquidity.remove.modal.receive")}
            </Text>

            <RemoveLiquidityReward
              name={position.name}
              symbol={position.symbol}
              amount={t("value", {
                value: removeLiquidityValues?.token,
                fixedPointScale: meta?.decimals ?? 12,
                type: "token",
              })}
            />
            <RemoveLiquidityReward
              name="Lerna"
              symbol="LRNA"
              amount={t("value", {
                value: removeLiquidityValues?.lrna,
                fixedPointScale: lrnaMeta?.decimals ?? 12,
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
              {t("liquidity.asset.liquidity.assetFees")}
            </Text>
            <Text fs={14} color="graySoft">
              {t("value.percentage", { value: omnipoolFee?.fee })}
            </Text>
          </div>
        </div>
        <Button variant="primary">
          {t("liquidity.remove.modal.confirm")}
        </Button>
      </form>
    </Modal>
  )
}
