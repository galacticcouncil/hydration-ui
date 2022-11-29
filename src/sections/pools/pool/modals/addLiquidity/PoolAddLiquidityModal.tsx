import { PoolAddLiquidityAssetSelect } from "./assetSelect/PoolAddLiquidityAssetSelect"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { PoolAddLiquidityConversion } from "./conversion/PoolAddLiquidityConversion"
import { BN_1, BN_100, DEFAULT_DECIMALS } from "utils/constants"
import { Row } from "components/Row/Row"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { Button } from "components/Button/Button"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"
import { usePools, usePoolShareToken } from "api/pools"
import { FC, useCallback, useMemo, useState } from "react"
import {
  useAddLiquidityMutation,
  useAddLiquidityPaymentInfo,
} from "api/addLiquidity"
import { useTotalIssuance } from "api/totalIssuance"
import { useTokensBalances } from "api/balances"
import { useSpotPrice } from "api/spotPrice"
import { getFixedPointAmount, getFloatingPointAmount } from "utils/balance"
import BigNumber from "bignumber.js"
import { PoolBase } from "@galacticcouncil/sdk"
import { useAccountStore } from "state/store"
import { useTranslation } from "react-i18next"
import { u32 } from "@polkadot/types"
import { getTradeFee } from "sections/pools/pool/Pool.utils"
import { useMath } from "utils/api"
import { useAssetMeta } from "api/assetMeta"

interface PoolAddLiquidityModalProps {
  pool: PoolBase
  setPoolAddress: (address: string) => void
}

export const PoolAddLiquidityModal: FC<PoolAddLiquidityModalProps> = ({
  pool,
  setPoolAddress,
}) => {
  const { t } = useTranslation()
  const pools = usePools()

  const { xyk } = useMath()
  const { account } = useAccountStore()
  const { data: shareToken } = usePoolShareToken(pool.address)
  const { data: shareTokenMeta } = useAssetMeta(shareToken?.token)

  const [input, setInput] = useState<{
    values: [string, string]
    lastUpdated: 0 | 1
  }>({ values: ["", ""], lastUpdated: 0 })

  const paymentInfo = useAddLiquidityPaymentInfo(
    pool.tokens[0].id,
    pool.tokens[1].id,
  )

  const handleAddLiquidity = useAddLiquidityMutation()
  const shareIssuance = useTotalIssuance(shareToken?.token)
  const spotPrice = useSpotPrice(pool.tokens[0].id, pool.tokens[1].id)

  const reserves = useTokensBalances(
    pool.tokens.map((i) => i.id),
    pool.address,
  )
  const balances = useTokensBalances(
    pool.tokens.map((i) => i.id),
    account?.address,
  )

  const shareTokenDecimals = useMemo(() => {
    if (shareTokenMeta?.decimals) {
      return shareTokenMeta.decimals.toNumber()
    }

    return DEFAULT_DECIMALS.toNumber()
  }, [shareTokenMeta])

  const calculatedShares = useMemo(() => {
    if (
      xyk &&
      reserves[0].data &&
      shareIssuance.data &&
      shareTokenDecimals &&
      input.values[0]
    ) {
      return new BigNumber(
        xyk.calculate_shares(
          getFixedPointAmount(
            reserves[0].data.balance,
            pool.tokens[0].decimals,
          ).toFixed(),
          getFixedPointAmount(
            new BigNumber(input.values[0]),
            pool.tokens[0].decimals,
          ).toFixed(),
          getFixedPointAmount(
            shareIssuance.data.total,
            shareTokenDecimals,
          ).toFixed(),
        ),
      )
    }

    return null
  }, [
    xyk,
    reserves,
    shareIssuance.data,
    shareTokenDecimals,
    input.values,
    pool.tokens,
  ])

  let calculatedRatio =
    shareIssuance.data &&
    calculatedShares &&
    calculatedShares.div(shareIssuance.data.total).multipliedBy(100)

  if (calculatedRatio && !calculatedRatio.isFinite()) {
    calculatedRatio = BN_100
  }

  const handleChange = useCallback(
    (value: string, currPosition: 0 | 1) => {
      const nextPosition = currPosition === 0 ? 1 : 0

      const currReserves = reserves[currPosition].data
      const nextReserves = reserves[nextPosition].data

      if (currReserves && nextReserves && xyk) {
        const values: [string, string] = ["", ""]

        values[currPosition] = value
        values[nextPosition] = getFloatingPointAmount(
          xyk.calculate_liquidity_in(
            currReserves.balance.toFixed(),
            nextReserves.balance.toFixed(),
            getFixedPointAmount(
              new BigNumber(value),
              pool.tokens[currPosition].decimals,
            ).toFixed(),
          ),
          pool.tokens[currPosition].decimals,
        ).toFixed(4)

        setInput({ values, lastUpdated: currPosition })
      }
    },
    [pool.tokens, reserves, xyk],
  )

  const handleSelectAsset = useCallback(
    (assetId: u32 | string, currPosition: 0 | 1) => {
      const nextPosition = currPosition === 0 ? 1 : 0

      const possibleNextPools = pools.data?.filter(
        (nextPool) => nextPool.tokens[currPosition].id === assetId,
      )
      const nextPool = possibleNextPools?.find(
        (nexPool) =>
          nexPool.tokens[nextPosition].id === pool?.tokens[nextPosition].id,
      )
      if (nextPool) {
        // Try to find pool with same second asset
        setPoolAddress(nextPool.address)
      } else if (possibleNextPools?.[currPosition]) {
        // Select first pool with same first asset
        setPoolAddress(possibleNextPools[currPosition].address)
      }

      // reset the value input
      handleChange("0", currPosition)
    },
    [pool, pools, setPoolAddress, handleChange],
  )

  async function handleSubmit() {
    const curr = input.lastUpdated
    const next = input.lastUpdated === 0 ? 1 : 0

    handleAddLiquidity.mutate([
      {
        id: pool.tokens[curr].id,
        amount: getFixedPointAmount(
          new BigNumber(input.values[curr]),
          pool.tokens[curr].decimals,
        ),
      },
      {
        id: pool.tokens[next].id,
        amount: getFixedPointAmount(
          new BigNumber(input.values[next]),
          pool.tokens[next].decimals,
        ).times(1.0 + 0.3), // TODO: add provision percentage configuration
      },
    ])
  }

  return (
    <div
      sx={{
        flex: "column",
        justify: "space-between",
        height: "calc(100% - var(--modal-header-title-height))",
      }}
    >
      <div>
        <PoolAddLiquidityAssetSelect
          name="assetA"
          allowedAssets={pools.data
            ?.filter((nextPool) => nextPool.tokens[1].id === pool?.tokens[1].id)
            .map((nextPool) => nextPool.tokens[0].id)}
          asset={pool.tokens[0].id}
          balance={balances[0].data?.balance}
          decimals={pool.tokens[0].decimals}
          assetName={pool.tokens[0].symbol}
          assetIcon={getAssetLogo(pool.tokens[0].symbol)}
          value={input.values[0]}
          onChange={(value) => handleChange(value, 0)}
          onSelectAsset={(assetId) => handleSelectAsset(assetId, 0)}
          sx={{ mt: 16 }}
        />
        <PoolAddLiquidityConversion
          firstValue={{ amount: BN_1, currency: pool.tokens[0].symbol }}
          secondValue={{
            amount: spotPrice.data?.spotPrice ?? BN_1,
            currency: pool.tokens[1].symbol,
          }}
        />
        <PoolAddLiquidityAssetSelect
          name="assetB"
          allowedAssets={pools.data
            ?.filter((nextPool) => nextPool.tokens[0].id === pool?.tokens[0].id)
            .map((nextPool) => nextPool.tokens[1].id)}
          asset={pool.tokens[1].id}
          balance={balances[1].data?.balance}
          decimals={pool.tokens[1].decimals}
          assetName={pool.tokens[1].symbol}
          assetIcon={getAssetLogo(pool.tokens[1].symbol)}
          value={input.values[1]}
          onChange={(value) => handleChange(value, 1)}
          onSelectAsset={(assetId) => handleSelectAsset(assetId, 1)}
        />

        <Row
          left={t("pools.addLiquidity.modal.row.tradeFee")}
          right={t("value.percentage", { value: getTradeFee(pool.tradeFee) })}
        />
        <Separator />
        <Row
          left={t("pools.addLiquidity.modal.row.transactionCost")}
          right={
            paymentInfo && (
              <Text>
                {t("pools.addLiquidity.modal.row.transactionCostValue", {
                  amount: paymentInfo.data?.partialFee,
                  fixedPointScale: 12,
                  decimalPlaces: 2,
                })}
              </Text>
            )
          }
        />
        <Separator />
        <Row
          left={t("pools.addLiquidity.modal.row.sharePool")}
          right={t("value.percentage", {
            value: calculatedRatio,
            decimalPlaces: 4,
          })}
        />
        <Separator />
        <Row
          left={t("pools.addLiquidity.modal.row.shareTokens")}
          right={
            calculatedShares && (
              <Text color="primary400">
                {t("value", {
                  value: calculatedShares,
                  decimalPlaces: 4,
                  fixedPointScale: shareTokenDecimals,
                })}
              </Text>
            )
          }
        />
      </div>
      {account ? (
        <Button
          text={t("pools.addLiquidity.modal.confirmButton")}
          variant="primary"
          fullWidth
          onClick={handleSubmit}
          sx={{ mt: 30 }}
        />
      ) : (
        <WalletConnectButton css={{ marginTop: 30, width: "100%" }} />
      )}
    </div>
  )
}
