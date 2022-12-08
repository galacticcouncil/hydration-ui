import { Modal } from "components/Modal/Modal"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Controller, useForm } from "react-hook-form"
import BigNumber from "bignumber.js"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { Text } from "components/Typography/Text/Text"
import { Separator } from "components/Separator/Separator"
import { Button } from "components/Button/Button"
import { u32 } from "@polkadot/types"

type AddLiquidityProps = {
  isOpen: boolean
  onClose: () => void
  id: string | u32
}

export const AddLiquidity = ({ isOpen, onClose, id }: AddLiquidityProps) => {
  const [asset, setAsset] = useState(id)

  const { t } = useTranslation()

  const form = useForm<{
    amount: string
  }>({})

  const onSubmit = async (values: any) => {
    console.log(values)
  }

  return (
    <Modal
      open={isOpen}
      title={t("pools.addLiquidity.modal.title")}
      onClose={onClose}
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        sx={{
          flex: "column",
          justify: "space-between",
          height: "100%",
          mt: 10,
        }}
      >
        <Controller
          name="amount"
          control={form.control}
          rules={{
            required: t("wallet.assets.transfer.error.amount.required"),
            validate: {
              validNumber: (value) => {
                try {
                  if (!new BigNumber(value).isNaN()) return true
                } catch {}
                return t("error.validNumber")
              },
              positive: (value) =>
                new BigNumber(value).gt(0) || t("error.positive"),
            },
          }}
          render={({
            field: { name, value, onChange },
            fieldState: { error },
          }) => (
            <WalletTransferAssetSelect
              title={t("wallet.assets.transfer.asset.label_mob")}
              name={name}
              value={value}
              onChange={onChange}
              asset={asset}
              onAssetChange={setAsset}
              error={error?.message}
            />
          )}
        />
        <div
          sx={{
            flex: "row",
            justify: "space-between",
            align: "center",
            mt: 20,
            mb: 37,
          }}
        >
          <Text color="basic300" fs={14}>
            {t("pools.pool.liquidity.poolFees")}
          </Text>
          <Text fs={14} color="white">
            0.15%
          </Text>
        </div>

        <Text color="pink500" fs={15} font="FontOver" tTransform="uppercase">
          Position Details
        </Text>

        <div
          sx={{
            flex: "row",
            justify: "space-between",
            align: "center",
            mt: 9,
            mb: 4,
          }}
        >
          <Text color="darkBlue300" fs={14}>
            Price:
          </Text>
          <Text fs={14} color="white">
            1 BTC = 20 000$
          </Text>
        </div>
        <Separator color="darkBlue401" />
        <div
          sx={{
            flex: "row",
            justify: "space-between",
            align: "center",
            mt: 8,
            mb: 4,
          }}
        >
          <Text color="darkBlue300" fs={14}>
            Received amount of Pool Shares
          </Text>
          <Text fs={14} color="white">
            1000
          </Text>
        </div>
        <Separator color="darkBlue401" />
        <Text color="warningOrange200" fs={14} fw={400} sx={{ mt: 17, mb: 24 }}>
          Please keep in mind that you’ll receive NFT for this position that
          will be available in your wallet after the transaction gets processed.
        </Text>
        <Separator
          color="darkBlue401"
          sx={{ mx: "-30px", mb: 20, width: "auto" }}
        />
        <Button variant="primary">Mint Liquidity Position</Button>
      </form>
    </Modal>
  )
}
