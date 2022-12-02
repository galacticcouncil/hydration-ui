import { FC, useState } from "react"
import { Modal } from "components/Modal/Modal"
import { Trans, useTranslation } from "react-i18next"
import {
  SSlippage,
  STradingPairContainer,
} from "sections/pools/pool/modals/removeLiquidity/PoolRemoveLiquidity.styled"
import { Button } from "components/Button/Button"
import { Heading } from "components/Typography/Heading/Heading"
import { Slider } from "components/Slider/Slider"
import { BoxSwitch } from "components/BoxSwitch/BoxSwitch"
import { Input } from "components/Input/Input"
import { Text } from "components/Typography/Text/Text"
import { PoolRemoveLiquidityReward } from "sections/pools/pool/modals/removeLiquidity/reward/PoolRemoveLiquidityReward"
import { Separator } from "components/Separator/Separator"
import { useForm, Controller } from "react-hook-form"
import { useAccountStore, useStore } from "state/store"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"
import { PoolBase } from "@galacticcouncil/sdk"
import { usePoolShareToken } from "api/pools"
import { useTokenBalance } from "api/balances"
import { useTotalLiquidity } from "api/totalLiquidity"
import { BN_0, BN_1 } from "utils/constants"
import { useApiPromise } from "utils/api"
import { usePaymentInfo } from "api/transaction"
import { useSpotPrice } from "api/spotPrice"
import { FormValues } from "utils/helpers"
import { useAccountCurrency } from "../../../../../api/payments"
import { useAssetMeta } from "../../../../../api/assetMeta"

const options = [
  { label: "25%", value: 25 },
  { label: "50%", value: 50 },
  { label: "75%", value: 75 },
  { label: "MAX", value: 100 },
]

type Props = {
  isOpen: boolean
  onClose: () => void
  pool: PoolBase
}

const PoolRemoveLiquidityInput = (props: {
  value: number
  onChange: (value: number) => void
}) => {
  const [input, setInput] = useState("")

  const onChange = (value: string) => {
    setInput(value)

    const parsedValue = Number.parseFloat(value)
    if (!Number.isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 100) {
      props.onChange(parsedValue)
    }
  }

  const onSelect = (value: number) => {
    setInput("")
    props.onChange(value)
  }

  return (
    <>
      <Slider
        value={[props.value]}
        onChange={([val]) => onSelect(val)}
        min={0}
        max={100}
        step={1}
      />

      <SSlippage>
        <BoxSwitch
          options={options}
          selected={props.value}
          onSelect={onSelect}
        />
        <Input
          value={input}
          onChange={onChange}
          name="custom"
          label="Custom"
          placeholder="Custom"
        />
      </SSlippage>
    </>
  )
}

export const PoolRemoveLiquidity: FC<Props> = ({ isOpen, onClose, pool }) => {
  const { t } = useTranslation()
  const form = useForm<{ value: number }>({ defaultValues: { value: 25 } })
  const { createTransaction } = useStore()
  const { account } = useAccountStore()
  const accountCurrency = useAccountCurrency(account?.address)
  const feeMeta = useAssetMeta(accountCurrency.data)

  const api = useApiPromise()

  const shareToken = usePoolShareToken(pool.address)
  const shareTokenBalance = useTokenBalance(
    shareToken.data?.token,
    account?.address,
  )

  const totalLiquidity = useTotalLiquidity(pool.address)

  const value = form.watch("value")
  const amount = shareTokenBalance.data?.balance
    ?.multipliedBy(value)
    .dividedToIntegerBy(100)

  const removeAmount = pool.tokens.map(({ balance }) => {
    return amount && totalLiquidity.data && !totalLiquidity.data.isZero()
      ? amount.multipliedBy(balance).dividedBy(totalLiquidity.data)
      : BN_0
  })

  const paymentInfoEstimate = usePaymentInfo(
    api.tx.xyk.removeLiquidity(pool.tokens[0].id, pool.tokens[1].id, "0"),
  )

  const spotPrice = useSpotPrice(pool.tokens[0].id, pool.tokens[1].id)

  async function handleSubmit(data: FormValues<typeof form>) {
    if (!account) throw new Error("Missing account")
    if (!shareTokenBalance.data?.balance)
      throw new Error("No share token balance")

    const tokenAmount = shareTokenBalance.data?.balance
      .multipliedBy(data.value)
      .dividedToIntegerBy(100)

    return await createTransaction({
      tx: api.tx.xyk.removeLiquidity(
        pool.tokens[0].id,
        pool.tokens[1].id,
        tokenAmount.toFixed(),
      ),
    })
  }

  return (
    <Modal
      title={t("pools.removeLiquidity.modal.title")}
      open={isOpen}
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
          <Heading fs={[32, 42]} lh={52} sx={{ my: 16 }}>
            {t("value.percentage", { value })}
          </Heading>

          <Controller
            name="value"
            control={form.control}
            render={({ field }) => (
              <PoolRemoveLiquidityInput
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <STradingPairContainer>
            <Text color="neutralGray400">
              {t("pools.removeLiquidity.modal.receive")}
            </Text>

            <PoolRemoveLiquidityReward
              name="Token"
              symbol={pool.tokens[0].symbol}
              amount={t("value", {
                value: removeAmount[0],
                fixedPointScale: pool.tokens[0].decimals,
                decimalPlaces: 4,
              })}
            />
            <PoolRemoveLiquidityReward
              name="Token"
              symbol={pool.tokens[1].symbol}
              amount={t("value", {
                value: removeAmount[1],
                fixedPointScale: pool.tokens[1].decimals,
                decimalPlaces: 4,
              })}
            />
          </STradingPairContainer>

          <div sx={{ mt: 16, mb: 32 }}>
            <div
              sx={{ flex: "row", align: "center", justify: "space-between" }}
            >
              <Text color="neutralGray500" fs={15}>
                {t("pools.removeLiquidity.modal.cost")}
              </Text>
              <div sx={{ flex: "row", align: "center", gap: 4 }}>
                <Text fs={14}>
                  {t("pools.removeLiquidity.modal.row.transactionCostValue", {
                    amount: paymentInfoEstimate.data?.partialFee,
                    symbol: feeMeta.data?.symbol,
                    fixedPointScale: feeMeta.data?.decimals ?? 12,
                    decimalPlaces: 2,
                  })}
                </Text>
              </div>
            </div>
            <Separator sx={{ my: 8 }} size={2} />
            <div
              sx={{ flex: "row", align: "center", justify: "space-between" }}
            >
              <Text fs={15} color="neutralGray500">
                {t("pools.removeLiquidity.modal.price")}
              </Text>
              <Text fs={14}>
                <Trans
                  t={t}
                  i18nKey="pools.removeLiquidity.modal.row.spotPrice"
                  tOptions={{
                    firstAmount: BN_1,
                    secondAmount: spotPrice.data?.spotPrice,
                    firstCurrency: pool.tokens[0].symbol,
                    secondCurrency: pool.tokens[1].symbol,
                  }}
                />
              </Text>
            </div>
          </div>
        </div>
        {account ? (
          <Button type="submit" variant="primary" fullWidth>
            {t("pools.removeLiquidity.modal.confirm")}
          </Button>
        ) : (
          <WalletConnectButton css={{ marginTop: 20, width: "100%" }} />
        )}
      </form>
    </Modal>
  )
}
