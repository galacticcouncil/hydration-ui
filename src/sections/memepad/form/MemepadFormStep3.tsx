import { FC, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { CreateXYKPool } from "sections/pools/modals/CreateXYKPool/CreateXYKPool"
import { MemepadStep3Values } from "./MemepadForm.utils"
import { Modal } from "components/Modal/Modal"
import { useTranslation } from "react-i18next"
import { TAsset } from "api/assetDetails"

type MemepadFormStep3Props = {
  form: UseFormReturn<MemepadStep3Values>
  assetA?: string
  onAssetBSelect?: (asset: TAsset) => void
}

export const MemepadFormStep3: FC<MemepadFormStep3Props> = ({
  form,
  assetA,
  onAssetBSelect,
}) => {
  const { t } = useTranslation()

  const [assetsBOpen, setAssetsBOpen] = useState(false)

  const onClose = () => {
    setAssetsBOpen(false)
  }

  return (
    <>
      <CreateXYKPool
        controlledForm={form}
        defaultAssetA={assetA}
        onTxClose={onClose}
        onAssetBOpen={() => setAssetsBOpen(true)}
        onAssetBSelect={onAssetBSelect}
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
