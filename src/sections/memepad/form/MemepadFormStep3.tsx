import { useTokenBalance } from "api/balances"
import { Modal } from "components/Modal/Modal"
import { FC, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { MemepadSpinner } from "sections/memepad/components/MemepadSpinner"
import { CreateXYKPool } from "sections/pools/modals/CreateXYKPool/CreateXYKPool"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { MemepadStep3Values } from "./MemepadForm.utils"
import { useMemepadFormContext } from "./MemepadFormContext"

type MemepadFormStep3Props = {
  form: UseFormReturn<MemepadStep3Values>
}

export const MemepadFormStep3: FC<MemepadFormStep3Props> = ({ form }) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { summary, setSummaryValue } = useMemepadFormContext()

  const assetA = summary?.internalId

  const [assetsBOpen, setAssetsBOpen] = useState(false)

  const onClose = () => {
    setAssetsBOpen(false)
  }

  const { data: balance } = useTokenBalance(assetA, account?.address, {
    refetchInterval: 2500,
  })

  const isReady = !!balance?.freeBalance.gt(0)

  if (!isReady) {
    return (
      <MemepadSpinner
        title={t("memepad.form.spinner.fundCheck.title")}
        description={t("memepad.form.spinner.fundCheck.description")}
      />
    )
  }

  return (
    <>
      <CreateXYKPool
        controlledForm={form}
        defaultAssetA={assetA}
        onTxClose={onClose}
        onAssetBOpen={() => setAssetsBOpen(true)}
        onAssetBSelect={(asset) => setSummaryValue("xykPoolAssetId", asset.id)}
        onAssetSelectClose={onClose}
        submitHidden
      >
        {({ form, assetsB }) => (
          <>
            {form}
            <Modal
              open={assetsBOpen}
              onClose={onClose}
              title={t("selectAsset.title")}
              headerVariant="GeistMono"
              noPadding
            >
              {assetsBOpen && assetsB}
            </Modal>
          </>
        )}
      </CreateXYKPool>
    </>
  )
}
