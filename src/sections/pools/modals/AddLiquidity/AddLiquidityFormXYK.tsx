import { Controller, useForm } from "react-hook-form"
import BigNumber from "bignumber.js"
import { BN_0, BN_1 } from "utils/constants"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { Trans, useTranslation } from "react-i18next"
import { PoolAddLiquidityInformationCard } from "./AddLiquidityInfoCard"
import { Separator } from "components/Separator/Separator"
import { Button } from "components/Button/Button"
import {
  getFixedPointAmount,
  getFloatingPointAmount,
  scale,
  scaleHuman,
} from "utils/balance"
import { useStore } from "state/store"
import { useCallback, useMemo, useState } from "react"
import { useRpcProvider } from "providers/rpcProvider"
import { useSpotPrice } from "api/spotPrice"
import { TXYKPool, useRefetchPositions } from "sections/pools/PoolsPage.utils"
import { TokensConversion } from "./components/TokensConvertion/TokensConversion"
import { useTokensBalances } from "api/balances"
import * as xyk from "@galacticcouncil/math-xyk"
import { useXYKConsts } from "api/xyk"
import { TShareToken } from "api/assetDetails"
import { getXYKPoolShare, useXYKZodSchema } from "./AddLiquidity.utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert } from "components/Alert/Alert"

type Props = {
  assetId: string
  initialAmount?: string
  onClose: () => void
  onAssetOpen?: () => void
  pool: TXYKPool
}

const opposite = (value: "assetA" | "assetB") =>
  value === "assetA" ? "assetB" : "assetA"

type FromValues = {
  assetA: string
  assetB: string
  lastUpdated: "assetA" | "assetB"
}

export const AddLiquidityFormXYK = ({ pool, onClose }: Props) => {
  const { assets } = useRpcProvider()
  const { data: xykConsts } = useXYKConsts()
  const { t } = useTranslation()
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()
  const refetch = useRefetchPositions()

  const shareTokenMeta = assets.getAsset(pool.id) as TShareToken
  const [assetA, assetB] = assets.getAssets(shareTokenMeta.assets)

  const formAssets = {
    assetA,
    assetB,
  }

  const zodSchema = useXYKZodSchema(formAssets.assetA.id, formAssets.assetB.id)

  const form = useForm<FromValues>({
    resolver: zodSchema ? zodResolver(zodSchema) : undefined,
    mode: "onChange",
    defaultValues: {
      assetA: "",
      assetB: "",
      lastUpdated: "assetA",
    },
  })

  const spotPrice = useSpotPrice(formAssets.assetA.id, formAssets.assetB.id)

  const [{ data: assetAReserve }, { data: assetBReserve }] = useTokensBalances(
    [formAssets.assetA.id, formAssets.assetB.id],
    pool.poolAddress,
  )

  const reserves = useMemo(
    () => ({
      assetA: assetAReserve,
      assetB: assetBReserve,
    }),
    [assetAReserve, assetBReserve],
  )

  const lastUpdated = form.watch("lastUpdated")
  const [assetValueA, assetValueB] = form.watch(["assetA", "assetB"])

  const assetValues = useMemo(
    () => ({ assetA: assetValueA, assetB: assetValueB }),
    [assetValueA, assetValueB],
  )

  const minAddLiquidityValidation = useMemo(() => {
    const { decimals } = formAssets[lastUpdated]
    const mainAsset = assetValues[lastUpdated]

    return scaleHuman(xykConsts?.minPoolLiquidity ?? 0, decimals).gt(mainAsset)
  }, [assetValues, formAssets, lastUpdated, xykConsts?.minPoolLiquidity])

  const { calculatedShares, calculatedRatio } = useMemo(() => {
    const { totalShare } = pool.shareTokenIssuance ?? {}

    if (totalShare && reserves.assetA && assetValues.assetA) {
      const calculatedShares = BigNumber(
        xyk.calculate_shares(
          reserves.assetA.balance.toString(),
          scale(assetValues.assetA, formAssets.assetA.decimals).toFixed(),
          totalShare.toString(),
        ),
      )
      const calculatedRatio = getXYKPoolShare(totalShare, calculatedShares)

      return { calculatedShares, calculatedRatio }
    }

    return {}
  }, [pool, reserves.assetA, assetValues.assetA, formAssets.assetA.decimals])

  const onSubmit = async () => {
    const inputData = {
      assetA: {
        id: formAssets[lastUpdated].id,
        amount: scale(
          assetValues[lastUpdated],
          formAssets[lastUpdated].decimals,
        ),
      },
      assetB: {
        id: formAssets[opposite(lastUpdated)].id,
        amount: scale(
          assetValues[opposite(lastUpdated)],
          formAssets[opposite(lastUpdated)].decimals,
        ).decimalPlaces(0),
      },
    }

    return await createTransaction(
      {
        tx: api.tx.xyk.addLiquidity(
          inputData.assetA.id,
          inputData.assetB.id,
          inputData.assetA.amount.toFixed(),
          inputData.assetB.amount.toFixed(),
        ),
      },
      {
        onSuccess: () => refetch(),
        onSubmitted: () => onClose(),
        onClose,
        onBack: () => {},
        toast: {
          onLoading: (
            <Trans
              t={t}
              i18nKey="liquidity.add.modal.xyk.toast.onLoading"
              tOptions={{
                shares: calculatedShares,
                fixedPointScale: shareTokenMeta.decimals,
              }}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
          onSuccess: (
            <Trans
              t={t}
              i18nKey="liquidity.add.modal.xyk.toast.onLoading"
              tOptions={{
                shares: calculatedShares,
                fixedPointScale: shareTokenMeta.decimals,
              }}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
          onError: (
            <Trans
              t={t}
              i18nKey="liquidity.add.modal.xyk.toast.onLoading"
              tOptions={{
                shares: calculatedShares,
                fixedPointScale: shareTokenMeta.decimals,
              }}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
        },
      },
    )
  }

  const handleChange = useCallback(
    (value: string, name: "assetA" | "assetB") => {
      const assetDecimals = formAssets[name].decimals
      const pairAssetDecimals = formAssets[opposite(name)].decimals

      const currReserves = reserves[name]
      const nextReserves = reserves[opposite(name)]

      if (currReserves && nextReserves) {
        const pairTokenValue = getFloatingPointAmount(
          xyk.calculate_liquidity_in(
            currReserves.balance.toFixed(),
            nextReserves.balance.toFixed(),
            getFixedPointAmount(
              new BigNumber(value),
              assetDecimals.toString(),
            ).toFixed(),
          ),
          pairAssetDecimals.toString(),
        ).toString()

        form.setValue(name, value, { shouldValidate: true, shouldTouch: true })
        form.setValue(opposite(name), pairTokenValue, {
          shouldValidate: true,
          shouldTouch: true,
        })
        form.setValue("lastUpdated", name)
      }
    },
    [formAssets, reserves, form],
  )

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
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
            />
          )}
        />
        <TokensConversion
          firstValue={{ amount: BN_1, symbol: formAssets.assetA.symbol }}
          secondValue={{
            amount: spotPrice.data?.spotPrice ?? BN_0,
            symbol: formAssets.assetB.symbol,
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

        <Spacer size={24} />
        <Text color="pink500" fs={15} font="FontOver" tTransform="uppercase">
          {t("liquidity.add.modal.positionDetails")}
        </Text>
        <SummaryRow
          label="Share of pool:"
          content={t("value.percentage", {
            value: calculatedRatio,
            type: "token",
          })}
        />
        <Separator color="darkBlue400" opacity={0.3} />
        <SummaryRow
          label="Received amount of Pool Shares:"
          content={t("value.token", {
            value: calculatedShares,
            fixedPointScale: shareTokenMeta.decimals,
          })}
        />

        {minAddLiquidityValidation && (
          <Alert variant="warning" css={{ marginBottom: 8 }}>
            {t("liquidity.xyk.addLiquidity.warning")}
          </Alert>
        )}
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
      <Button
        variant="primary"
        type="submit"
        disabled={!form.formState.isValid || minAddLiquidityValidation}
      >
        {t("confirm")}
      </Button>
    </form>
  )
}
