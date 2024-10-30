import { TFarmAprData, useFarmCurrentPeriod } from "api/farms"
import { Modal } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import {
  LoadingPage,
  ModalContents,
} from "components/Modal/contents/ModalContents"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { TJoinFarmsInput, useJoinFarms } from "utils/farms/deposit"
import { FarmDetailsCard } from "sections/pools/farms/components/detailsCard/FarmDetailsCard"
import { FarmDetailsModal } from "sections/pools/farms/modals/details/FarmDetailsModal"
import { TLPData } from "utils/omnipool"
import { JoinFarmsForm } from "./JoinFarmsForm"
import { getStepState, Stepper } from "components/Stepper/Stepper"
import { usePoolData } from "sections/pools/pool/Pool"
import { TDeposit } from "api/deposits"

type JoinFarmModalProps = {
  onClose: () => void
  position?: TLPData
  depositNft?: TDeposit
  initialFarms?: TFarmAprData[]
}

export enum Page {
  JOIN_FARM,
  FARM_DETAILS,
  WAIT,
}

export const JoinFarmModal = ({
  onClose,
  position,
  depositNft,
  initialFarms,
}: JoinFarmModalProps) => {
  const { t } = useTranslation()
  const {
    pool: { meta, id: poolId, farms: allFarms },
  } = usePoolData()
  const [selectedFarm, setSelectedFarm] = useState<TFarmAprData | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  const { getCurrentPeriod } = useFarmCurrentPeriod()
  const { page, direction, paginateTo } = useModalPagination()

  const farms = initialFarms ?? allFarms
  const isMultipleFarms = farms.length > 1

  const joinFarms = useJoinFarms({
    poolId,
    farms,
    deposit: {
      onClose,
      disableAutoClose: isMultipleFarms,
      onSuccess: () => setCurrentStep(1),
      onSubmitted: () => (isMultipleFarms ? paginateTo(Page.WAIT) : null),
      onError: onClose,
    },
    redeposit: {
      onClose,
      onError: onClose,
    },
  })

  const onSubmit = (input: TJoinFarmsInput) => {
    joinFarms(input)
  }

  const onBack = () => {
    paginateTo(Page.JOIN_FARM)
    setSelectedFarm(null)
  }

  const steps = [
    {
      id: 0,
      label: t("farms.modal.join.first"),
      loadingLabel: t("farms.modal.join.first.loading"),
    },
    ...(isMultipleFarms
      ? [
          {
            id: 1,
            label: t("farms.modal.join.rest"),
            loadingLabel: t("farms.modal.join.rest.loading"),
          },
        ]
      : []),
  ]

  return (
    <Modal
      open
      onClose={onClose}
      disableCloseOutside
      topContent={
        isMultipleFarms ? (
          <Stepper
            steps={steps.map((step) => ({
              label: step.label,
              state: getStepState(step.id, currentStep),
            }))}
          />
        ) : undefined
      }
    >
      <ModalContents
        onClose={onClose}
        page={page}
        direction={direction}
        onBack={onBack}
        contents={[
          {
            title: t("farms.modal.join.title", {
              assetSymbol: meta.symbol,
            }),
            content: (
              <>
                {!!depositNft && (
                  <Text color="basic400" sx={{ mb: 12 }}>
                    {t("farms.modal.join.description", {
                      assets: meta.symbol,
                    })}
                  </Text>
                )}
                <div sx={{ flex: "column", gap: 8 }}>
                  {farms.map((farm, i) => (
                    <FarmDetailsCard
                      key={i}
                      farm={farm}
                      onSelect={() => {
                        setSelectedFarm(farm)
                        paginateTo(Page.FARM_DETAILS)
                      }}
                    />
                  ))}
                </div>
                <JoinFarmsForm
                  position={position}
                  farms={farms}
                  depositNft={depositNft}
                  onSubmit={onSubmit}
                />
              </>
            ),
          },
          {
            title: t("farms.modal.details.title"),
            content: selectedFarm && (
              <FarmDetailsModal
                farm={selectedFarm}
                currentBlock={getCurrentPeriod(
                  selectedFarm?.blocksPerPeriod.toString(),
                )?.toNumber()}
              />
            ),
          },
          {
            title: steps[currentStep].label,
            headerVariant: "gradient",
            content: <LoadingPage title={steps[currentStep].loadingLabel} />,
          },
        ]}
      />
    </Modal>
  )
}
