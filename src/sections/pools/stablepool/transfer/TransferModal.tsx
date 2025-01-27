import { Modal } from "components/Modal/Modal"
import {
  LoadingPage,
  ModalContents,
} from "components/Modal/contents/ModalContents"
import { TransferOptions, Option } from "./TransferOptions"
import { useState } from "react"
import { Button } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import { AddStablepoolLiquidity } from "./AddStablepoolLiquidity"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { getStepState, Stepper } from "components/Stepper/Stepper"
import { AddLiquidityForm } from "sections/pools/modals/AddLiquidity/AddLiquidityForm"
import { useRpcProvider } from "providers/rpcProvider"
import { useModalPagination } from "components/Modal/Modal.utils"
import { TPoolFullData } from "sections/pools/PoolsPage.utils"
import { BN_100, STABLEPOOL_TOKEN_DECIMALS } from "utils/constants"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { TFarmAprData } from "api/farms"
import { ISubmittableResult } from "@polkadot/types/types"
import { useRefetchAccountAssets } from "api/deposits"
import { useStore } from "state/store"
import { createToastMessages } from "state/toasts"
import { scaleHuman } from "utils/balance"
import { isEvmAccount } from "utils/evm"
import { useAssets } from "providers/assets"
import { usePoolData } from "sections/pools/pool/Pool"
import { getSharesToGet } from "sections/pools/modals/AddLiquidity/AddLiquidity.utils"
import { useOmnipoolDataObserver } from "api/omnipool"
import BN from "bignumber.js"
import { LimitModal } from "sections/pools/modals/AddLiquidity/components/LimitModal/LimitModal"

export enum Page {
  OPTIONS,
  ADD_LIQUIDITY,
  WAIT,
  MOVE_TO_OMNIPOOL,
  ASSETS,
  LIMIT_LIQUIDITY,
}

type Props = {
  onClose: () => void
  defaultPage: Page
  farms: TFarmAprData[]
}

export const TransferModal = ({ onClose, defaultPage, farms }: Props) => {
  const { api } = useRpcProvider()
  const { account } = useAccount()
  const { getAssetWithFallback } = useAssets()
  const { pool } = usePoolData()
  const refetch = useRefetchAccountAssets()
  const omnipoolAssets = useOmnipoolDataObserver()
  const { createTransaction } = useStore()
  const isEvm = isEvmAccount(account?.address)
  const [isJoinFarms, setIsJoinFarms] = useState(farms.length > 0)

  const { id: poolId, canAddLiquidity, meta } = pool as TPoolFullData
  const omipoolAsset = omnipoolAssets.dataMap?.get(poolId)

  const assets = Object.keys(pool.meta.meta ?? {})

  const { t } = useTranslation()
  const [assetId, setAssetId] = useState<string | undefined>(assets[0])
  const [sharesAmount, setSharesAmount] = useState<string>()
  const [currentStep, setCurrentStep] = useState(0)

  const { page, direction, paginateTo } = useModalPagination(defaultPage)

  const [selectedOption, setSelectedOption] = useState<Option>(
    canAddLiquidity ? "OMNIPOOL" : "STABLEPOOL",
  )

  const isOptionsPage = defaultPage === Page.OPTIONS
  const isOnlyStablepool = selectedOption === "STABLEPOOL"
  const isAddingToOmnipool = defaultPage === Page.MOVE_TO_OMNIPOOL

  const steps = [
    ...(isOptionsPage
      ? [
          {
            label: t("liquidity.stablepool.transfer.select"),
            loadingLabel: t("liquidity.stablepool.transfer.select"),
          },
        ]
      : []),
    ...(isAddingToOmnipool
      ? []
      : [
          {
            label: t("liquidity.stablepool.transfer.provide"),
            loadingLabel: t("liquidity.stablepool.transfer.adding"),
          },
        ]),
    ...(isOnlyStablepool
      ? []
      : [
          {
            label: t(
              isJoinFarms
                ? "liquidity.stablepool.transfer.moveAndJoinFarms"
                : "liquidity.stablepool.transfer.move",
            ),
            loadingLabel: t("liquidity.stablepool.transfer.adding"),
          },
        ]),
  ]

  const onAddToStablepoolSuccess = async (
    result: ISubmittableResult,
    calculatedShares: string,
  ) => {
    let omnipoolShares = ""

    if (!isEvm) {
      for (const record of result.events) {
        if (api.events.tokens.Deposited.is(record.event)) {
          if (record.event.data.currencyId.toString() === pool.id) {
            omnipoolShares = record.event.data.amount.toString()
          }
        }
      }
    } else {
      const balance = await api.query.tokens.accounts(
        account?.address ?? "",
        pool.id,
      )
      const free = balance.free.toBigNumber()
      const diff = scaleHuman(free, STABLEPOOL_TOKEN_DECIMALS)
        .minus(scaleHuman(calculatedShares, STABLEPOOL_TOKEN_DECIMALS))
        .abs()

      // go with the whole balance
      if (diff.lt(0.1)) {
        omnipoolShares = free.toString()
      } else {
        omnipoolShares = calculatedShares
      }
    }

    if (omnipoolShares && assetId && omipoolAsset) {
      const shares = getSharesToGet(omipoolAsset, omnipoolShares).toString()
      const limitShares = BN(shares)
        .times(BN_100.minus(2).div(BN_100))
        .toFixed(0)

      await createTransaction(
        {
          tx: isJoinFarms
            ? api.tx.omnipoolLiquidityMining.addLiquidityAndJoinFarms(
                farms.map<[string, string]>((farm) => [
                  farm.globalFarmId,
                  farm.yieldFarmId,
                ]),
                pool.id,
                omnipoolShares,
                //@ts-ignore
                limitShares,
              )
            : api.tx.omnipool.addLiquidity(pool.id, omnipoolShares),
          title: t(
            isJoinFarms
              ? "liquidity.stablepool.transfer.moveAndJoinFarms"
              : "liquidity.stablepool.transfer.move",
          ),
        },
        {
          onSuccess: () => {
            refetch()
          },
          onSubmitted: () => {
            onClose()
          },
          onError: () => onClose(),
          onClose,
          toast: createToastMessages(
            `liquidity.add.modal.${isJoinFarms ? "andJoinFarms." : ""}toast`,
            {
              t,
              tOptions: {
                value: scaleHuman(omnipoolShares, meta.decimals),
                symbol: meta.symbol,
                where: "Omnipool",
              },
            },
          ),
        },
      )
    } else {
      onClose()
    }
  }

  const goBack = () => {
    if (page === Page.ASSETS) {
      return paginateTo(Page.ADD_LIQUIDITY)
    }

    if (page === Page.MOVE_TO_OMNIPOOL) {
      return paginateTo(Page.ADD_LIQUIDITY)
    }

    paginateTo(page - 1)
    setCurrentStep((step) => step - 1)
  }

  return (
    <Modal
      open
      onClose={onClose}
      disableCloseOutside={true}
      topContent={
        steps.length > 1 ? (
          <Stepper
            sx={{ px: [10] }}
            steps={steps.map((step, idx) => ({
              label: step.label,
              state: getStepState(idx, currentStep),
            }))}
          />
        ) : undefined
      }
    >
      <ModalContents
        onClose={onClose}
        direction={direction}
        page={page}
        onBack={
          !defaultPage && ![Page.OPTIONS, Page.WAIT].includes(page)
            ? goBack
            : page === Page.LIMIT_LIQUIDITY
              ? () => paginateTo(Page.MOVE_TO_OMNIPOOL)
              : undefined
        }
        contents={[
          {
            title: t("liquidity.stablepool.transfer.options"),
            headerVariant: "gradient",
            content: (
              <>
                <TransferOptions
                  disableOmnipool={!canAddLiquidity}
                  onSelect={setSelectedOption}
                  farms={farms}
                  selected={selectedOption}
                />
                <Button
                  variant="primary"
                  sx={{ mt: 21 }}
                  onClick={() => {
                    paginateTo(Page.ADD_LIQUIDITY)
                    setCurrentStep(1)
                  }}
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
                isStablepoolOnly={isOnlyStablepool}
                onCancel={onClose}
                onClose={onClose}
                onSubmitted={(shares) => {
                  if (isOnlyStablepool) {
                    onClose()
                  }

                  setSharesAmount(shares)
                  paginateTo(Page.WAIT)
                }}
                onSuccess={(result, omnipoolShares) => {
                  if (isOnlyStablepool) {
                    refetch()
                    return
                  }

                  setCurrentStep((step) => step + 1)
                  onAddToStablepoolSuccess(result, omnipoolShares)
                  paginateTo(Page.WAIT)
                }}
                onAssetOpen={() => paginateTo(Page.ASSETS)}
                asset={getAssetWithFallback(assetId ?? poolId)}
                isJoinFarms={isJoinFarms && !isOnlyStablepool}
                setIsJoinFarms={setIsJoinFarms}
              />
            ),
          },
          {
            title: steps[currentStep].label,
            headerVariant: "gradient",
            content: <LoadingPage title={steps[currentStep].loadingLabel} />,
          },
          {
            title: t("liquidity.stablepool.addToOmnipool"),
            headerVariant: "gradient",
            content: (
              <AddLiquidityForm
                initialAmount={sharesAmount}
                assetId={poolId}
                onClose={onClose}
                farms={farms}
                setLiquidityLimit={() => paginateTo(Page.LIMIT_LIQUIDITY)}
              />
            ),
          },
          {
            title: t("selectAsset.title"),
            headerVariant: "GeistMono",
            noPadding: true,
            content: (
              <AssetsModalContent
                hideInactiveAssets={true}
                allAssets={true}
                allowedAssets={assets}
                onSelect={(asset) => {
                  setAssetId(asset.id)
                  paginateTo(Page.ADD_LIQUIDITY)
                }}
              />
            ),
          },
          {
            title: t("liquidity.add.modal.limit.title"),
            noPadding: true,
            headerVariant: "GeistMono",
            content: (
              <LimitModal onConfirm={() => paginateTo(Page.MOVE_TO_OMNIPOOL)} />
            ),
          },
        ]}
      />
    </Modal>
  )
}
