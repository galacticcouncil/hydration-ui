import { Modal } from "components/Modal/Modal"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { TransferOptions } from "./TransferOptions"
import { ComponentProps, useState } from "react"
import { Button } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import { AddStablepoolLiquidity } from "./AddStablepoolLiquidity"
import { u32 } from "@polkadot/types-codec"
import { AssetsModalContent } from "../../../assets/AssetsModal"
import BigNumber from "bignumber.js"
import { CurrencyReserves } from "./CurrencyReserves"

type Props = {
  isOpen: boolean
  onClose: () => void
  poolId: u32
  assetMetaById?: Map<string, { symbol: string }>
  balanceByAsset?: Map<string, { free: BigNumber; value: BigNumber }>
  total: { free: BigNumber; value: BigNumber }
}

enum Page {
  OPTIONS,
  OMNIPOOL,
  STABLEPOOL,
  ASSETS,
}

export const TransferModal = ({
  isOpen,
  onClose,
  poolId,
  balanceByAsset,
  total,
  assetMetaById,
}: Props) => {
  const { t } = useTranslation()
  // TODO: skip stablepool / omnipool selection for now. When omnipool flow is ready use useState<Page>(Page.OPTIONS)
  const [page, setPage] = useState<Page>(Page.STABLEPOOL)

  const [assetId, setAssetId] = useState<string>(poolId.toString())
  const [selectedOption, setSelectedOption] =
    useState<ComponentProps<typeof TransferOptions>["selected"]>("STABLEPOOL")

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
    <Modal
      open={isOpen}
      onClose={onClose}
      disableCloseOutside={true}
      bottomContent={
        page === Page.STABLEPOOL ? (
          <CurrencyReserves
            assets={Array.from(balanceByAsset?.entries() ?? []).map(
              ([id, balance]) => ({
                id,
                symbol: assetMetaById?.get(id)?.symbol,
                balance: balance.free,
                value: balance.value,
              }),
            )}
          />
        ) : null
      }
    >
      <ModalContents
        onClose={onClose}
        page={page}
        // TODO: skip stablepool / omnipool selection for now. When omnipool flow is ready use onBack={page ? handleBack : undefined}
        onBack={page === Page.ASSETS ? handleBack : undefined}
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
