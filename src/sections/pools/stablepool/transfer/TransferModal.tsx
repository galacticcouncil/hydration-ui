import { Modal } from "components/Modal/Modal"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { TransferOptions } from "./components/TransferOptions"
import { ComponentProps, useState } from "react"
import { Button } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import { AddStablepoolLiquidity } from "./AddStablepoolLiquidity"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { CurrencyReserves } from "./components/CurrencyReserves"
import { AssetMetaById, BalanceByAsset } from "sections/pools/PoolsPage.utils"
import { u32 } from "@polkadot/types-codec"
import BigNumber from "bignumber.js"
import { Stepper } from "components/Stepper/Stepper"

type Props = {
  poolId: u32
  isOpen: boolean
  onClose: () => void
  fee: BigNumber
  assetMetaById?: AssetMetaById
  balanceByAsset?: BalanceByAsset
  refetchPositions: () => void
  assets: { id: string }[]
  reserves: { asset_id: number; amount: string }[]
}

enum Page {
  OPTIONS,
  OMNIPOOL,
  STABLEPOOL,
  ASSETS,
  MOVE_TO_OMNIPOOL,
}

export const TransferModal = ({
  assets,
  poolId,
  fee,
  isOpen,
  onClose,
  balanceByAsset,
  assetMetaById,
  reserves,
  refetchPositions,
}: Props) => {
  const { t } = useTranslation()
  const [page, setPage] = useState<Page>(Page.OPTIONS)
  const [assetId, setAssetId] = useState<string>(assets[0]?.id)

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
      topContent={
        <Stepper
          steps={[
            {
              label: "Select Pool",
              state: "done",
            },
            {
              label: "Provide Liquidity",
              state: "active",
            },
            {
              label: "Confirm 1/2",
              state: "todo",
            },
            {
              label: "Confirm 2/2",
              state: "todo",
            },
          ]}
        />
      }
      bottomContent={
        [Page.STABLEPOOL, Page.OMNIPOOL].includes(page) ? (
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
            content: (
              <AddStablepoolLiquidity
                poolId={poolId}
                onClose={() => {
                  console.log("CLOSE")
                }}
                onSuccess={() => {
                  console.log("SUCCESS")
                  setPage(Page.MOVE_TO_OMNIPOOL)
                }}
                reserves={reserves}
                onAssetOpen={() => setPage(Page.ASSETS)}
                asset={assetMetaById?.get(assetId)}
                tradeFee={tradeFee}
              />
            ),
          },
          {
            title: t("liquidity.add.modal.title"),
            headerVariant: "gradient",
            content: (
              <AddStablepoolLiquidity
                poolId={poolId}
                onClose={onClose}
                onSuccess={refetchPositions}
                reserves={reserves}
                onAssetOpen={() => setPage(Page.ASSETS)}
                asset={assetMetaById?.get(assetId)}
                fee={fee}
              />
            ),
          },
          {
            title: t("selectAsset.title"),
            headerVariant: "gradient",
            content: (
              <AssetsModalContent
                hideInactiveAssets={true}
                allowedAssets={assets.map((asset) => asset.id)}
                onSelect={(asset) => {
                  setAssetId(asset.id)
                  handleBack()
                }}
              />
            ),
          },
          {
            title: "Move to omnipool",
            headerVariant: "gradient",
            content: <div></div>,
          },
        ]}
      />
    </Modal>
  )
}
