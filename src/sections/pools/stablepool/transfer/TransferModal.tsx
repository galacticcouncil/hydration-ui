import { Modal } from "components/Modal/Modal"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { TransferOptions } from "./components/TransferOptions"
import { ComponentProps, useRef, useState } from "react"
import { Button } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import { AddStablepoolLiquidity } from "./AddStablepoolLiquidity"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { CurrencyReserves } from "./components/CurrencyReserves"
import { AssetMetaById, BalanceByAsset } from "sections/pools/PoolsPage.utils"
import { u32 } from "@polkadot/types-codec"
import BigNumber from "bignumber.js"
import { Stepper } from "components/Stepper/Stepper"
import { AddLiquidityForm } from "sections/pools/modals/AddLiquidity/AddLiquidityForm"
import { Spinner } from "components/Spinner/Spinner.styled"
import { Text } from "components/Typography/Text/Text"

export enum Page {
  OPTIONS,
  ADD_LIQUIDITY,
  ASSETS,
  WAIT,
  MOVE_TO_OMNIPOOL,
}

type PathOption = ComponentProps<typeof TransferOptions>["selected"]

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
  defaultPage?: Page
  defaultSelectedOption?: PathOption
}

const usePage = (initial: Page) => {
  const [current, setCurrent] = useState(initial)
  const prevPage = useRef<Page[]>([initial])

  const prev = () => {
    setCurrent(prevPage.current.pop() ?? initial)
  }

  const set = (p: Page) => {
    prevPage.current.push(current)
    setCurrent(p)
  }

  return {
    currentPage: current,
    setPage: set,
    goBack: prev,
    path: prevPage.current,
  }
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
  defaultPage,
  defaultSelectedOption,
}: Props) => {
  const { t } = useTranslation()
  const { currentPage, setPage, goBack, path } = usePage(
    defaultPage ?? Page.OPTIONS,
  )
  const [assetId, setAssetId] = useState<string>(assets[0]?.id)
  const [sharesAmount, setSharesAmount] = useState<string>()

  const [selectedOption, setSelectedOption] = useState<PathOption>(
    defaultSelectedOption ?? "OMNIPOOL",
  )

  const steps =
    selectedOption === "STABLEPOOL"
      ? [
          { text: "Select Pool", page: Page.OPTIONS },
          { text: "Provide Liquidity", page: Page.ADD_LIQUIDITY },
          { text: "Confirm", page: Page.ADD_LIQUIDITY + 1 },
        ]
      : [
          { text: "Select Pool", page: Page.OPTIONS },
          { text: "Provide Liquidity", page: Page.ADD_LIQUIDITY },
          { text: "Wait For Transaction", page: Page.WAIT },
          { text: "Move to Omnipool", page: Page.MOVE_TO_OMNIPOOL },
        ]

  const getStepState = (stepPage: Page) => {
    if (stepPage === currentPage) {
      return "active" as const
    }

    return path.includes(stepPage) ? ("done" as const) : ("todo" as const)
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      disableCloseOutside={true}
      topContent={
        !defaultPage &&
        ![Page.OPTIONS, Page.ASSETS].includes(currentPage) && (
          <Stepper
            steps={steps.map((step) => ({
              label: step.text,
              state: getStepState(step.page),
            }))}
          />
        )
      }
      bottomContent={
        currentPage === Page.ADD_LIQUIDITY ? (
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
        page={currentPage}
        onBack={
          !defaultPage && ![Page.OPTIONS, Page.WAIT].includes(currentPage)
            ? goBack
            : undefined
        }
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
                  onClick={() => setPage(Page.ADD_LIQUIDITY)}
                >
                  {t("next")}
                </Button>
              </>
            ),
          },
          {
            title: t("liquidity.add.modal.title"),
            headerVariant: "gradient",
            content: (
              <AddStablepoolLiquidity
                poolId={poolId}
                onCancel={onClose}
                onClose={() => {
                  if (selectedOption === "STABLEPOOL") {
                    onClose()
                  }
                }}
                onSubmitted={(shares) => {
                  if (selectedOption === "STABLEPOOL") {
                    onClose()
                  }

                  setSharesAmount(shares)
                  setPage(Page.WAIT)
                }}
                onSuccess={() => {
                  if (selectedOption === "STABLEPOOL") {
                    return refetchPositions()
                  }

                  setPage(Page.MOVE_TO_OMNIPOOL)
                }}
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
                  goBack()
                }}
              />
            ),
          },
          {
            title: "Move to omnipool",
            headerVariant: "gradient",
            content: (
              <div
                sx={{
                  flex: "column",
                  gap: 50,
                  align: "center",
                  justify: "center",
                  height: 240,
                }}
              >
                <Spinner width={50} height={50} />
                <Text color="whiteish500">Waiting for transaction</Text>
              </div>
            ),
          },
          {
            title: "Move to omnipool",
            headerVariant: "gradient",
            content: (
              <AddLiquidityForm
                initialAmount={sharesAmount}
                assetId={poolId}
                onSuccess={() => {
                  refetchPositions()
                  onClose()
                }}
                onClose={onClose}
              />
            ),
          },
        ]}
      />
    </Modal>
  )
}
