import { Modal } from "components/Modal/Modal"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { TransferOptions } from "./TransferOptions"
import { ComponentProps, useState } from "react"
import { Button } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import { AddStablepoolLiquidity } from "./AddStablepoolLiquidity"
import { AssetsModalContent } from "../../../assets/AssetsModal"
import { CurrencyReserves } from "./CurrencyReserves"
import { AssetMetaById, BalanceByAsset } from "../../PoolsPage.utils"
import { u32 } from "@polkadot/types-codec"
import BigNumber from "bignumber.js"

type Props = {
  poolId: u32
  isOpen: boolean
  onClose: () => void
  tradeFee: BigNumber
  assetMetaById?: AssetMetaById
  balanceByAsset?: BalanceByAsset
  refetchPositions: () => void
}

enum Page {
  OPTIONS,
  OMNIPOOL,
  STABLEPOOL,
  ASSETS,
}

export const TransferModal = ({
  poolId,
  tradeFee,
  isOpen,
  onClose,
  balanceByAsset,
  assetMetaById,
  refetchPositions,
}: Props) => {
  const { t } = useTranslation()
  // TODO: skip stablepool / omnipool selection for now. When omnipool flow is ready use useState<Page>(Page.OPTIONS)
  const [page, setPage] = useState<Page>(Page.STABLEPOOL)

  const [assetId, setAssetId] = useState<string>(
    assetMetaById?.keys().next().value,
  )
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
                balance: balance.free?.shiftedBy(
                  assetMetaById?.get(id)?.decimals?.neg()?.toNumber() ?? -12,
                ),
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
                  onClick={() =>
                    setPage(
                      selectedOption === "OMNIPOOL"
                        ? Page.OMNIPOOL
                        : Page.STABLEPOOL,
                    )
                  }
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
            title: t("liquidity.add.modal.title"),
            headerVariant: "gradient",
            content: (
              <AddStablepoolLiquidity
                poolId={poolId}
                onClose={onClose}
                onSuccess={refetchPositions}
                balanceByAsset={balanceByAsset}
                onAssetOpen={() => setPage(Page.ASSETS)}
                asset={assetMetaById?.get(assetId)}
                tradeFee={tradeFee}
              />
            ),
          },
          {
            title: t("selectAsset.title"),
            headerVariant: "gradient",
            content: (
              <AssetsModalContent
                hideInactiveAssets={true}
                allowedAssets={Array.from(assetMetaById?.keys() ?? [])}
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
