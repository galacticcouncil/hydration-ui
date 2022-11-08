import { PoolAddLiquidityAssetSelect } from "./assetSelect/PoolAddLiquidityAssetSelect"
import { getAssetLogo } from "../../../../../components/AssetIcon/AssetIcon"
import { PoolAddLiquidityConversion } from "./conversion/PoolAddLiquidityConversion"
import { BN_1, BN_100, DEFAULT_DECIMALS } from "../../../../../utils/constants"
import { Row } from "../../../../../components/Row/Row"
import { Separator } from "../../../../../components/Separator/Separator"
import { Text } from "../../../../../components/Typography/Text/Text"
import { Button } from "../../../../../components/Button/Button"
import { WalletConnectButton } from "../../../../wallet/connect/modal/WalletConnectButton"
import { usePools, usePoolShareToken } from "../../../../../api/pools"
import { FC, useCallback, useMemo, useState } from "react"
import { useAddLiquidity } from "../../../../../api/addLiquidity"
import { useTotalIssuance } from "../../../../../api/totalIssuance"
import { useTokenBalance } from "../../../../../api/balances"
import { useSpotPrice } from "../../../../../api/spotPrice"
import {
  getFixedPointAmount,
  getFloatingPointAmount,
} from "../../../../../utils/balance"
import BigNumber from "bignumber.js"
import { PoolBase } from "@galacticcouncil/sdk"
import { useAccountStore } from "../../../../../state/store"
import { useTranslation } from "react-i18next"
import { u32 } from "@polkadot/types"
import { getTradeFee } from "sections/pools/pool/Pool.utils"
import { useMath } from "utils/api"
import { useAssetMeta } from "../../../../../api/assetMeta"

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

  const { account } = useAccountStore()
  const { data: shareToken } = usePoolShareToken(pool.address)
  const { data: shareTokenMeta } = useAssetMeta(shareToken?.token)

  const [inputAssetA, setInputAssetA] = useState("0")
  const [inputAssetB, setInputAssetB] = useState("0")

  const { handleAddLiquidity, paymentInfo } = useAddLiquidity(
    pool.tokens[0].id,
    pool.tokens[1].id,
  )

  const shareIssuance = useTotalIssuance(shareToken?.token)
  const assetAReserve = useTokenBalance(pool.tokens[0].id, pool.address)
  const assetBReserve = useTokenBalance(pool.tokens[1].id, pool.address)

  const { xyk } = useMath()
  const { data: spotPriceData } = useSpotPrice(
    pool.tokens[0].id,
    pool.tokens[1].id,
  )

  const accountAssetABalance = useTokenBalance(
    pool.tokens[0].id,
    account?.address,
  )

  const accountAssetBBalance = useTokenBalance(
    pool.tokens[1].id,
    account?.address,
  )

  const handleChangeAssetAInput = (value: string) => {
    if (assetAReserve.data && assetBReserve.data && xyk) {
      const parsedValue = getFixedPointAmount(value, pool.tokens[0].decimals)

      const calculatedAmount = xyk.calculate_liquidity_in(
        assetAReserve.data.balance.toFixed(),
        assetBReserve.data.balance.toFixed(),
        parsedValue.toFixed(),
      )
      setInputAssetB(
        getFloatingPointAmount(
          calculatedAmount,
          pool.tokens[0].decimals,
        ).toFixed(4),
      )
    }
    setInputAssetA(value)
  }

  const handleChangeAssetBInput = (value: string) => {
    if (assetAReserve.data && assetBReserve.data && xyk) {
      const parsedValue = getFixedPointAmount(
        new BigNumber(value),
        pool.tokens[0].decimals,
      )
      const calculatedAmount = xyk.calculate_liquidity_in(
        assetBReserve.data.balance.toFixed(),
        assetAReserve.data.balance.toFixed(),
        parsedValue.toFixed(),
      )

      setInputAssetA(
        getFloatingPointAmount(
          calculatedAmount,
          pool.tokens[1].decimals,
        ).toFixed(4),
      )
    }
    setInputAssetB(value)
  }

  const shareTokenDecimals = useMemo(() => {
    if (shareTokenMeta?.data?.decimals) {
      return shareTokenMeta.data?.decimals.toNumber()
    }

    return DEFAULT_DECIMALS.toNumber()
  }, [shareTokenMeta])

  const calculatedShares = useMemo(() => {
    if (
      xyk &&
      assetAReserve.data &&
      shareIssuance.data &&
      shareTokenDecimals &&
      inputAssetA
    ) {
      return new BigNumber(
        xyk.calculate_shares(
          getFixedPointAmount(
            assetAReserve.data.balance,
            pool.tokens[0].decimals,
          ).toFixed(),
          getFixedPointAmount(
            new BigNumber(inputAssetA),
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
    assetAReserve.data,
    shareIssuance.data,
    shareTokenDecimals,
    inputAssetA,
    pool.tokens,
  ])

  const calculatedRatio =
    shareIssuance.data &&
    calculatedShares &&
    calculatedShares.pow(shareIssuance.data.total).multipliedBy(100)

  const handleSelectAsset = useCallback(
    (assetId: u32 | string, tokenPosition: 0 | 1) => {
      const nextTokenPosition = tokenPosition === 0 ? 1 : 0

      const possibleNextPools = pools.data?.filter(
        (nextPool) => nextPool.tokens[tokenPosition].id === assetId,
      )
      const nextPool = possibleNextPools?.find(
        (nexPool) =>
          nexPool.tokens[nextTokenPosition].id ===
          pool?.tokens[nextTokenPosition].id,
      )
      if (nextPool) {
        // Try to find pool with same second asset
        setPoolAddress(nextPool.address)
      } else if (possibleNextPools?.[tokenPosition]) {
        // Select first pool with same first asset
        setPoolAddress(possibleNextPools[tokenPosition].address)
      }
    },
    [pool, pools, setPoolAddress],
  )

  async function handleSubmit() {
    handleAddLiquidity.mutate([
      {
        id: pool.tokens[0].id,
        amount: getFixedPointAmount(
          new BigNumber(inputAssetA),
          pool.tokens[0].decimals,
        ),
      },
      {
        id: pool.tokens[1].id,
        // For some reason, when amount_b == amount_b_max_limit,
        // the transaction fails with AssetAmountExceededLimit
        // TODO: investiage, whether we're not doing something wrong
        amount: getFixedPointAmount(
          new BigNumber(inputAssetB),
          pool.tokens[1].decimals,
        ).plus(1),
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
          onSelectAsset={(assetId) => {
            handleSelectAsset(assetId, 0)
            handleChangeAssetAInput("0")
          }}
          asset={pool.tokens[0].id}
          balance={accountAssetABalance.data?.balance}
          decimals={pool.tokens[0].decimals}
          currency={{
            short: pool.tokens[0].symbol,
            full: pool.tokens[0].symbol,
          }} /*TODO: full token name*/
          assetIcon={getAssetLogo(pool.tokens[0].symbol)}
          value={inputAssetA}
          onChange={handleChangeAssetAInput}
          sx={{ mt: 16 }}
        />
        <PoolAddLiquidityConversion
          firstValue={{ amount: BN_1, currency: pool.tokens[0].symbol }}
          secondValue={{
            amount: spotPriceData?.spotPrice ?? BN_1,
            currency: pool.tokens[1].symbol,
          }}
        />
        <PoolAddLiquidityAssetSelect
          name="assetB"
          allowedAssets={pools.data
            ?.filter((nextPool) => nextPool.tokens[0].id === pool?.tokens[0].id)
            .map((nextPool) => nextPool.tokens[1].id)}
          onSelectAsset={(assetId) => {
            handleSelectAsset(assetId, 1)
            handleChangeAssetBInput("0")
          }}
          asset={pool.tokens[1].id}
          balance={accountAssetBBalance.data?.balance}
          decimals={pool.tokens[1].decimals}
          currency={{
            short: pool.tokens[1].symbol,
            full: pool.tokens[1].symbol,
          }} /*TODO: full token name*/
          assetIcon={getAssetLogo(pool.tokens[1].symbol)}
          value={inputAssetB}
          onChange={handleChangeAssetBInput}
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
                  amount: paymentInfo.partialFee,
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
          right={`${(calculatedRatio && calculatedRatio.isFinite()
            ? calculatedRatio
            : BN_100
          ).toFixed()}%`}
        />
        <Separator />
        {/*TODO add tooltip component afterwards */}
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
          disabled={handleAddLiquidity.isLoading}
          onClick={handleSubmit}
          sx={{ mt: 30 }}
        />
      ) : (
        <WalletConnectButton css={{ marginTop: 30, width: "100%" }} />
      )}
    </div>
  )
}
