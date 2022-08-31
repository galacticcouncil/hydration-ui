import { BasiliskIcon } from "assets/icons/tokens/BasiliskIcon"
import { SakuraIcon } from "assets/icons/tokens/SakuraIcon"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Row } from "components/Row/Row"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { PoolAddLiquidityConversion } from "sections/pools/pool/modals/addLiquidity/conversion/PoolAddLiquidityConversion"
import { PoolAddLiquidityAssetSelect } from "sections/pools/pool/modals/addLiquidity/assetSelect/PoolAddLiquidityAssetSelect"
import { useTokensBalances } from "api/balances"
import { PoolConfig } from "../../Pool"

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
  const [assetABalance, assetBBalance] = useTokensBalances([assetA, assetB])
  const [inputAssetA, setInputAssetA] = useState("4523")
  const [inputAssetB, setInputAssetB] = useState("1234")

  return (
    <Modal
      open={isOpen}
      title={t("pools.addLiquidity.modal.title")}
      onClose={onClose}
    >
      <PoolAddLiquidityAssetSelect
        balance={assetABalance}
        usd={2456}
        mt={16}
        currency={{ short: "SAK", full: "Sakura" }}
        assetIcon={<SakuraIcon />}
        value={inputAssetA}
        onChange={setInputAssetA}
      />
      <PoolAddLiquidityConversion
        firstValue={{ amount: 1, currency: "SAK" }}
        secondValue={{ amount: 0.000123, currency: "BSX" }}
      />
      <PoolAddLiquidityAssetSelect
        balance={assetBBalance}
        usd={2456}
        currency={{ short: "BSX", full: "Basilisk" }}
        assetIcon={<BasiliskIcon />}
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
      <Button
        text={t("pools.addLiquidity.modal.confirmButton")}
        variant="primary"
        fullWidth
        mt={30}
      />
    </Modal>
  )
}
