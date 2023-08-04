import { Modal } from "components/Modal/Modal"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { TransferOptions } from "./TransferOptions"
import { ComponentProps, useState } from "react"
import { Button } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import { AddStablepoolLiquidity } from "./AddStablepoolLiquidity"
import { u32 } from "@polkadot/types-codec"
import { AssetsModalContent } from "../../../assets/AssetsModal"

type Props = {
  isOpen: boolean
  onClose: () => void
  poolId: u32
}

enum Page {
  OPTIONS,
  OMNIPOOL,
  STABLEPOOL,
  ASSETS,
}

export const TransferModal = ({ isOpen, onClose, poolId }: Props) => {
  const { t } = useTranslation()
  const [page, setPage] = useState<Page>(Page.OPTIONS)
  const [assetId, setAssetId] = useState<string>(poolId.toString())
  const [selectedOption, setSelectedOption] =
    useState<ComponentProps<typeof TransferOptions>["selected"]>("OMNIPOOL")

  const handleBack = () => {
    if (page === Page.OMNIPOOL || page === Page.STABLEPOOL) {
      return setPage(Page.OPTIONS)
    }

    if (selectedOption === "OMNIPOOL") {
      return setPage(Page.OMNIPOOL)
    }

    if (selectedOption === "STABLEPOOL") {
      return setPage(Page.STABLEPOOL)
    }
  }

  return (
    <Modal open={isOpen} onClose={onClose} disableCloseOutside={true}>
      <ModalContents
        onClose={onClose}
        page={page}
        onBack={page ? handleBack : undefined}
        contents={[
          {
            title: t("liquidity.stablepool.transfer.options"),
            headerVariant: "gradient",
            content: (
              <>
                <TransferOptions
                  onSelect={setSelectedOption}
                  selected={selectedOption}
                />
                <Button
                  variant="primary"
                  sx={{ mt: 21 }}
                  onClick={() => setPage(selectedOption === "OMNIPOOL" ? 1 : 2)}
                >
                  {t("next")}
                </Button>
              </>
            ),
          },
          {
            title: t("liquidity.stablepool.transfer.omnipool"),
            headerVariant: "gradient",
            content: <div />,
          },
          {
            title: t("liquidity.stablepool.transfer.stablepool"),
            headerVariant: "gradient",
            content: (
              <AddStablepoolLiquidity
                onSuccess={console.log}
                onAssetOpen={() => setPage(3)}
                assetId={assetId}
              />
            ),
          },
          {
            title: t("selectAsset.title"),
            headerVariant: "gradient",
            content: (
              <AssetsModalContent
                onSelect={(asset) => {
                  setAssetId(asset.id)
                  handleBack()
                }}
              />
            ),
          },
        ]}
      />
    </Modal>
  )
}
