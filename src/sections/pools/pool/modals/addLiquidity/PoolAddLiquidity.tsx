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
import { PoolConfig } from "../../Pool"
import { useAddPoolAddLiquidity } from "./PoolAddLiquidity.utils"
import { getDecimalAmount, getFullDisplayBalance } from "utils/balance"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { useAddLiquidity } from "api/addLiquidity"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"
import { useStore } from "state/store"

type Props = PoolConfig & {
  isOpen: boolean
  onClose: () => void
}

export const PoolAddLiquidity: FC<Props> = ({
  isOpen,
  onClose,
  assetA,
  assetB,
}) => {
  const { t } = useTranslation()

  const { account } = useStore()

  const { data: dataAssetA } = useAddPoolAddLiquidity(assetA)
  const { data: dataAssetB } = useAddPoolAddLiquidity(assetB)

  const [inputAssetA, setInputAssetA] = useState("0")
  const [inputAssetB, setInputAssetB] = useState("0")

  const { pendingTx, handleAddLiquidity } = useAddLiquidity()

  async function handleSubmit() {
    try {
      handleAddLiquidity([
        {
          id: assetA,
          amount: getDecimalAmount(
            new BigNumber(inputAssetA),
            dataAssetA.asset.decimals,
          ),
        },
        {
          id: assetB,
          amount: getDecimalAmount(
            new BigNumber(inputAssetB),
            dataAssetB.asset.decimals,
          ),
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
        asset={assetA}
        balance={getFullDisplayBalance(
          dataAssetA.balance,
          dataAssetA.asset.decimals,
          dataAssetA.asset?.decimals,
        )}
        usd={2456}
        mt={16}
        currency={{ short: dataAssetA.asset?.name ?? "", full: "Sakura" }}
        assetIcon={getAssetLogo(dataAssetA.asset.symbol)}
        value={inputAssetA}
        onChange={setInputAssetA}
      />
      <PoolAddLiquidityConversion
        firstValue={{ amount: 1, currency: dataAssetA.asset.name ?? "" }}
        secondValue={{
          amount: 0.000123,
          currency: dataAssetB.asset.name ?? "",
        }}
      />
      <PoolAddLiquidityAssetSelect
        asset={assetB}
        balance={getFullDisplayBalance(
          dataAssetB.balance,
          dataAssetB.asset?.decimals,
          dataAssetB.asset?.decimals,
        )}
        usd={2456}
        currency={{ short: dataAssetB.asset?.name ?? "", full: "Basilisk" }}
        assetIcon={getAssetLogo(dataAssetB.asset.symbol)}
        value={inputAssetB}
        onChange={setInputAssetB}
      />

      <Row left={t("pools.addLiquidity.modal.row.apr")} right="5%" />
      <Separator />
      <Row
        left={t("pools.addLiquidity.modal.row.transactionCost")}
        right={
          <>
            <Text mr={4}>≈ 12 BSX</Text>
            <Text color="primary400">(2%)</Text>
          </>
        }
      />
      <Separator />
      <Row left={t("pools.addLiquidity.modal.row.sharePool")} right="5%" />
      <Separator />
      {/*TODO add tooltip component afterwards */}
      <Row
        left={t("pools.addLiquidity.modal.row.shareTokens")}
        right={<Text color="primary400">3000</Text>}
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
        <WalletConnectButton mt={30} fullWidth />
      )}
    </Modal>
  )
}
