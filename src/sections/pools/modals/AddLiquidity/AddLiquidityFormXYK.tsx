import { Controller, FieldErrors, useForm } from "react-hook-form"
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
import { scale, scaleHuman } from "utils/balance"
import { ToastMessage, useStore } from "state/store"
import { BaseSyntheticEvent, useCallback, useMemo } from "react"
import { useRpcProvider } from "providers/rpcProvider"
import { useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useSpotPrice } from "api/spotPrice"
import { TXYKPool } from "sections/pools/PoolsPage.utils"
import { TokensConversion } from "./components/TokensConvertion/TokensConversion"
import { useTokensBalances } from "api/balances"
import * as xyk from "@galacticcouncil/math-xyk"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { getXYKPoolShare, useXYKZodSchema } from "./AddLiquidity.utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { TOAST_MESSAGES } from "state/toasts"
import { Alert } from "components/Alert/Alert"
import { ISubmittableResult } from "@polkadot/types/types"
import { Farm } from "api/farms"
import { useRefetchAccountPositions } from "api/deposits"

type Props = {
  onClose: () => void
  pool: TXYKPool
  onSuccess: (result: ISubmittableResult, shares: string) => void
  onSubmitted?: () => void
  farms: Farm[]
  setIsJoinFarms: (value: boolean) => void
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

export const AddLiquidityFormXYK = ({
  pool,
  onClose,
  onSuccess,
  onSubmitted,
  farms,
  setIsJoinFarms,
}: Props) => {
  const queryClient = useQueryClient()
  const { account } = useAccount()
  const { t } = useTranslation()
  const refetch = useRefetchAccountPositions()

  const { assets, decimals } = pool.meta
  const [assetA, assetB] = assets

  const { zodSchema, balanceAMax, balanceBMax, balanceA, balanceB } =
    useXYKZodSchema(assetA, assetB, pool.meta, farms)
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

  const { formState } = form

  const spotPrice = useSpotPrice(assetA.id, assetB.id)
  const [{ data: assetAReserve }, { data: assetBReserve }] = useTokensBalances(
    [assetA.id, assetB.id],
    pool.poolAddress,
  )

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

  const { api } = useRpcProvider()
  const { createTransaction } = useStore()

  const onSubmit = async (_: FormValues, e?: BaseSyntheticEvent) => {
    const submitAction = (e?.nativeEvent as SubmitEvent)
      ?.submitter as HTMLButtonElement
    const isJoiningFarms = submitAction?.name === "joinFarms"

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

    const toast = TOAST_MESSAGES.reduce((memo, type) => {
      const msType = type === "onError" ? "onLoading" : type
      memo[type] = (
        <Trans
          t={t}
          i18nKey={`liquidity.add.modal.xyk.toast.${msType}`}
          tOptions={{
            shares: shares,
            fixedPointScale: decimals,
          }}
        >
          <span />
          <span className="highlight" />
        </Trans>
      )
      return memo
    }, {} as ToastMessage)

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
        onSuccess: (result) => {
          refetch()
          queryClient.refetchQueries(
            QUERY_KEYS.tokenBalance(pool.id, account?.address),
          )
          onSuccess(result, scale(shares, decimals).toString())
        },
        onSubmitted: () => {
          !farms.length && !isJoiningFarms && onClose()
          form.reset()
          onSubmitted?.()
        },
        onClose,
        disableAutoClose: !!farms.length && isJoiningFarms,
        onBack: () => {},
        toast,
      },
    )
  }

  const onInvalidSubmit = (
    errors: FieldErrors<FormValues>,
    e?: BaseSyntheticEvent,
  ) => {
    const submitAction = (e?.nativeEvent as SubmitEvent)
      ?.submitter as HTMLButtonElement

    if (
      submitAction?.name === "addLiquidity" &&
      (errors.shares as { farm?: { message: string } }).farm
    ) {
      onSubmit({} as FormValues, e)
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
          xyk.calculate_liquidity_in(
            currReserves.balance.toFixed(),
            nextReserves.balance.toFixed(),
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
          const shares = xyk.calculate_shares(
            assetAReserve.balance.toString(),
            scale(form.getValues("assetA"), assetA.decimals).toFixed(),
            totalShare.toString(),
          )

          const ratio = getXYKPoolShare(
            totalShare,
            BigNumber(shares),
          ).toString()

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
  const customErrors = form.formState.errors.shares as unknown as
    | {
        farm?: { message: string }
      }
    | undefined

  const isAddOnlyLiquidityDisabled =
    !!Object.keys(formState.errors.shares ?? {}).filter((key) => key !== "farm")
      .length ||
    !!formState.errors.assetA ||
    !!formState.errors.assetB

  return (
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
              balance={balanceA}
              balanceMax={balanceAMax}
            />
          )}
        />
        <TokensConversion
          firstValue={{ amount: BN_1, symbol: assetValues.assetA.meta.symbol }}
          secondValue={{
            amount: spotPrice.data?.spotPrice ?? BN_0,
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
              balance={balanceB}
              balanceMax={balanceBMax}
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
        {customErrors?.farm && (
          <Alert variant="warning" css={{ margin: "20px 0" }}>
            {customErrors.farm.message}
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
      {farms.length ? (
        <div sx={{ flex: "row", justify: "space-between" }}>
          <Button
            variant="secondary"
            name="addLiquidity"
            onClick={() => setIsJoinFarms(false)}
            disabled={isAddOnlyLiquidityDisabled || minAddLiquidityValidation}
          >
            {t("liquidity.add.modal.onlyAddLiquidity")}
          </Button>
          <Button
            variant="primary"
            name="joinFarms"
            onClick={() => setIsJoinFarms(true)}
            disabled={
              !!Object.keys(formState.errors).length ||
              minAddLiquidityValidation
            }
          >
            {t("liquidity.add.modal.joinFarms")}
          </Button>
        </div>
      ) : (
        <Button
          variant="primary"
          disabled={!!Object.keys(formState.errors).length || !zodSchema}
        >
          {t("liquidity.add.modal.confirmButton")}
        </Button>
      )}
    </form>
  )
}
