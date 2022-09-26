import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Row } from "components/Row/Row"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { PoolAddLiquidityConversion } from "sections/pools/pool/modals/addLiquidity/conversion/PoolAddLiquidityConversion"
import { PoolAddLiquidityAssetSelect } from "sections/pools/pool/modals/addLiquidity/assetSelect/PoolAddLiquidityAssetSelect"
import { getFixedPointAmount, getFloatingPointAmount } from "utils/balance"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { useAddLiquidity } from "api/addLiquidity"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"
import { useStore } from "state/store"
import { useMath } from "utils/math"
import { useTokenBalance } from "api/balances"
import { useTotalIssuance } from "api/totalIssuance"
import { BN_0, BN_1, BN_100 } from "utils/constants"
import { useAsset } from "api/asset"
import { usePoolShareToken } from "api/pools"
import { useSpotPrice } from "api/spotPrice"
import { PoolBase } from "@galacticcouncil/sdk"

type Props = {
  isOpen: boolean
  onClose: () => void
  pool: PoolBase
}

export const PoolAddLiquidity: FC<Props> = ({ isOpen, onClose, pool }) => {
  const { t } = useTranslation()

  const { account } = useStore()

  const { data: shareToken } = usePoolShareToken(pool.address)
  const { data: dataShareToken } = useAsset(shareToken?.token)

  const [inputAssetA, setInputAssetA] = useState("0")
  const [inputAssetB, setInputAssetB] = useState("0")

  const { pendingTx, handleAddLiquidity, paymentInfo } = useAddLiquidity(
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

  const calculatedShares =
    xyk &&
    assetAReserve.data &&
    shareIssuance.data &&
    dataShareToken &&
    new BigNumber(
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
          dataShareToken.decimals.toNumber(),
        ).toFixed(),
      ),
    )

  const calculatedRatio =
    shareIssuance.data &&
    calculatedShares &&
    calculatedShares.pow(shareIssuance.data.total).multipliedBy(100)

  async function handleSubmit() {
    try {
      handleAddLiquidity([
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
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <Modal
      open={isOpen}
      title={t("pools.addLiquidity.modal.title")}
      onClose={onClose}
    >
      <PoolAddLiquidityAssetSelect
        name="assetA"
        asset={pool.tokens[0].id}
        balance={accountAssetABalance.data?.balance}
        decimals={pool.tokens[0].decimals}
        mt={16}
        currency={{
          short: pool.tokens[0].symbol,
          full: pool.tokens[0].symbol,
        }} /*TODO: full token name*/
        assetIcon={getAssetLogo(pool.tokens[0].symbol)}
        value={inputAssetA}
        onChange={handleChangeAssetAInput}
      />
      <PoolAddLiquidityConversion
        firstValue={{ amount: BN_1, currency: pool.tokens[0].symbol }}
        secondValue={{
          amount: spotPriceData?.spotPrice ?? BN_1,
          currency: pool.tokens[0].symbol,
        }}
      />
      <PoolAddLiquidityAssetSelect
        name="assetB"
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
        right={t("value.percentage", { value: pool.tradeFee })}
      />
      <Separator />
      <Row
        left={t("pools.addLiquidity.modal.row.transactionCost")}
        right={
          paymentInfo && (
            <>
              <Text>
                {t("pools.addLiquidity.modal.row.transactionCostValue", {
                  amount: paymentInfo.partialFee,
                  fixedPointScale: 12,
                  decimalPlaces: 2,
                })}
              </Text>
              {/*<Text color="primary400">(2%)</Text>*/} {/*TODO*/}
            </>
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
          <Text color="primary400">
            {t("value", {
              value: calculatedShares ?? BN_0,
              decimalPlaces: 4,
              fixedPointScale: dataShareToken?.decimals,
            })}
          </Text>
        }
      />
      {account ? (
        <Button
          text={t("pools.addLiquidity.modal.confirmButton")}
          variant="primary"
          fullWidth
          mt={30}
          disabled={pendingTx}
          onClick={handleSubmit}
        />
      ) : (
        <WalletConnectButton css={{ marginTop: 30, width: "100%" }} />
      )}
    </Modal>
  )
}
