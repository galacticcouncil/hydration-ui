import { Controller, FieldErrors, FormProvider, useForm } from "react-hook-form"
import BN from "bignumber.js"
import { BN_0, BN_1 } from "utils/constants"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { PoolAddLiquidityInformationCard } from "./AddLiquidityInfoCard"
import { Separator } from "components/Separator/Separator"
import { Button } from "components/Button/Button"
import { scale, scaleHuman } from "utils/balance"
import { useStore } from "state/store"
import { useCallback, useMemo, useState } from "react"
import { useRpcProvider } from "providers/rpcProvider"
import { useSpotPrice } from "api/spotPrice"
import { TXYKPool } from "sections/pools/PoolsPage.utils"
import { TokensConversion } from "./components/TokensConvertion/TokensConversion"
import {
  calculate_shares,
  calculate_liquidity_in,
} from "@galacticcouncil/math-xyk"
import { getXYKPoolShare, useXYKZodSchema } from "./AddLiquidity.utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { createToastMessages } from "state/toasts"
import { Alert } from "components/Alert/Alert"
import { ISubmittableResult } from "@polkadot/types/types"
import { useRefetchAccountAssets } from "api/deposits"
import { AvailableFarmsForm } from "./components/JoinFarmsSection/JoinFarmsSection"
import { useXYKSDKPools } from "api/xyk"

type Props = {
  onClose: () => void
  pool: TXYKPool
  onSuccess?: (result: ISubmittableResult, shares: string) => void
  onSubmitted?: () => void
}

type FormValues = {
  assetA: string
  assetB: string
  lastUpdated: "assetA" | "assetB"
  shares: string
  ratio: string
}

const opposite = (value: "assetA" | "assetB") =>
  value === "assetA" ? "assetB" : "assetA"

export const AddLiquidityFormXYK = ({ pool, onClose, onSuccess }: Props) => {
  const { t } = useTranslation()
  const refetchAccountAssets = useRefetchAccountAssets()
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()

  const {
    meta: { assets, decimals },
    farms = [],
  } = pool
  const [assetA, assetB] = assets
  const isFarms = farms.length > 0
  const [isJoinFarms, setIsJoinFarms] = useState(isFarms)

  const { zodSchema, balanceAMax, balanceBMax, balanceA, balanceB } =
    useXYKZodSchema(assetA, assetB, pool.meta, farms, pool.poolAddress)

  const form = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      assetA: "",
      assetB: "",
      lastUpdated: "assetA",
      shares: "",
      ratio: "",
    },
    resolver: zodSchema ? zodResolver(zodSchema) : undefined,
  })

  const { formState, reset } = form

  const { data: spotPrice } = useSpotPrice(assetA.id, assetB.id)
  const { data: xykPools } = useXYKSDKPools()
  const [assetAReserve, assetBReserve] =
    xykPools?.find((xykPool) => xykPool.address === pool.poolAddress)?.tokens ??
    []

  const lastUpdated = form.watch("lastUpdated")
  const [assetValueA, assetValueB, shares, ratio] = form.watch([
    "assetA",
    "assetB",
    "shares",
    "ratio",
  ])

  const assetValues = useMemo(() => {
    return {
      assetA: {
        value: assetValueA,
        meta: assetA,
        reserves: assetAReserve,
      },
      assetB: {
        value: assetValueB,
        meta: assetB,
        reserves: assetBReserve,
      },
    }
  }, [assetA, assetAReserve, assetB, assetBReserve, assetValueA, assetValueB])

  const onSubmit = async () => {
    const inputData = {
      assetA: {
        id: assetValues[lastUpdated].meta.id,
        amount: scale(
          assetValues[lastUpdated].value,
          assetValues[lastUpdated].meta.decimals,
        ),
      },
      assetB: {
        id: assetValues[opposite(lastUpdated)].meta.id,
        amount: scale(
          assetValues[opposite(lastUpdated)].value,
          assetValues[opposite(lastUpdated)].meta.decimals,
        ).decimalPlaces(0),
      },
    }

    return await createTransaction(
      {
        tx: isJoinFarms
          ? api.tx.xykLiquidityMining.addLiquidityAndJoinFarms(
              inputData.assetA.id,
              inputData.assetB.id,
              inputData.assetA.amount.toFixed(),
              inputData.assetB.amount.toFixed(),
              farms.map<[string, string]>((farm) => [
                farm.globalFarmId,
                farm.yieldFarmId,
              ]),
            )
          : api.tx.xyk.addLiquidity(
              inputData.assetA.id,
              inputData.assetB.id,
              inputData.assetA.amount.toFixed(),
              inputData.assetB.amount.toFixed(),
            ),
      },
      {
        onSuccess: (result) => {
          refetchAccountAssets()
          onSuccess?.(result, scale(shares, decimals).toString())
        },
        onSubmitted: () => {
          onClose()
          reset()
        },
        onClose,
        onBack: () => {},
        toast: createToastMessages("liquidity.add.modal.xyk.toast", {
          t,
          tOptions: {
            shares: shares,
            fixedPointScale: decimals,
          },
          components: ["span", "span.highlight"],
        }),
      },
    )
  }

  const onInvalidSubmit = (errors: FieldErrors<FormValues>) => {
    const { shares, ...blockingErrors } = errors

    if (!isJoinFarms && !Object.keys(blockingErrors).length) {
      onSubmit()
    }
  }
  const handleChange = useCallback(
    (value: string, name: "assetA" | "assetB") => {
      const assetDecimals = assetValues[name].meta.decimals
      const pairAssetDecimals = assetValues[opposite(name)].meta.decimals

      const currReserves = assetValues[name].reserves
      const nextReserves = assetValues[opposite(name)].reserves

      if (currReserves && nextReserves) {
        const pairTokenValue = scaleHuman(
          calculate_liquidity_in(
            currReserves.balance,
            nextReserves.balance,
            scale(value, assetDecimals).toFixed(),
          ),
          pairAssetDecimals,
        ).toString()

        form.setValue(name, value, { shouldValidate: true, shouldTouch: true })
        form.setValue(opposite(name), pairTokenValue, {
          shouldValidate: true,
          shouldTouch: true,
        })
        form.setValue("lastUpdated", name)

        const { totalShare } = pool.shareTokenIssuance ?? {}

        if (assetAReserve && totalShare) {
          const shares = calculate_shares(
            assetAReserve.balance.toString(),
            scale(form.getValues("assetA"), assetA.decimals).toFixed(),
            totalShare.toString(),
          )

          const ratio = getXYKPoolShare(totalShare, BN(shares)).toString()

          form.setValue("shares", shares, { shouldValidate: true })
          form.setValue("ratio", ratio)
        }
      }
    },
    [
      assetA.decimals,
      assetAReserve,
      assetValues,
      form,
      pool.shareTokenIssuance,
    ],
  )

  const minAddLiquidityValidation =
    form.formState.errors.shares?.message === "minAddLiquidity"

  const isSubmitDisabled =
    !!formState.errors.assetA ||
    !!formState.errors.assetB ||
    minAddLiquidityValidation

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}
        autoComplete="off"
        sx={{
          flex: "column",
          justify: "space-between",
          minHeight: "100%",
        }}
      >
        <div sx={{ flex: "column" }}>
          <Controller
            name="assetA"
            control={form.control}
            render={({ field: { name, value }, fieldState: { error } }) => (
              <WalletTransferAssetSelect
                title={t("wallet.assets.transfer.asset.label_mob")}
                name={name}
                value={value}
                onChange={(value) => handleChange(value, name)}
                asset={assetA.id}
                error={error?.message}
                disabled={!assetAReserve}
                balance={balanceA ? BN(balanceA) : undefined}
                balanceMax={balanceAMax ? BN(balanceAMax) : undefined}
              />
            )}
          />
          <TokensConversion
            firstValue={{
              amount: BN_1,
              symbol: assetValues.assetA.meta.symbol,
            }}
            secondValue={{
              amount: spotPrice?.spotPrice ? BN(spotPrice.spotPrice) : BN_0,
              symbol: assetValues.assetB.meta.symbol,
            }}
          />
          <Controller
            name="assetB"
            control={form.control}
            render={({ field: { name, value }, fieldState: { error } }) => (
              <WalletTransferAssetSelect
                title={t("wallet.assets.transfer.asset.label_mob")}
                name={name}
                value={value}
                onChange={(value) => handleChange(value, name)}
                asset={assetB.id}
                error={error?.message}
                disabled={!assetBReserve}
                balance={balanceB ? BN(balanceB) : undefined}
                balanceMax={balanceBMax ? BN(balanceBMax) : undefined}
              />
            )}
          />
          <Spacer size={4} />
          <SummaryRow
            label={t("liquidity.add.modal.poolTradeFee")}
            content={t("value.percentage", {
              value: pool.fee,
            })}
          />

          <AvailableFarmsForm
            name="shares"
            farms={farms}
            isJoinFarms={isJoinFarms}
            setIsJoinFarms={setIsJoinFarms}
          />

          <Spacer size={24} />
          <Text color="pink500" fs={15} font="GeistMono" tTransform="uppercase">
            {t("liquidity.add.modal.positionDetails")}
          </Text>
          <SummaryRow
            label="Share of pool:"
            content={t("value.percentage", {
              value: ratio,
              type: "token",
            })}
          />
          <Separator color="darkBlue400" opacity={0.3} />
          <SummaryRow
            label="Received amount of Pool Shares:"
            content={t("value.token", {
              value: shares,
              fixedPointScale: decimals,
            })}
          />

          {minAddLiquidityValidation && (
            <Alert variant="warning" css={{ marginBottom: 8 }}>
              {t("liquidity.xyk.addLiquidity.warning")}
            </Alert>
          )}
          <Spacer size={20} />
          <PoolAddLiquidityInformationCard />
          <Spacer size={20} />
        </div>
        <Separator
          color="darkBlue401"
          sx={{
            mx: "calc(-1 * var(--modal-content-padding))",
            mb: 20,
            width: "auto",
          }}
        />
        <Button variant="primary" disabled={isSubmitDisabled}>
          {isJoinFarms
            ? t("liquidity.add.modal.button.joinFarms")
            : t("liquidity.add.modal.confirmButton")}
        </Button>
      </form>
    </FormProvider>
  )
}
