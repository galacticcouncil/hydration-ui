import { Modal } from "components/Modal/Modal"
import { useTranslation } from "react-i18next"
import { Box } from "components/Box/Box"
import { useAPR } from "utils/apr"
import { u32 } from "@polkadot/types"
import { PoolToken } from "@galacticcouncil/sdk"
import { ComponentProps, Fragment, useState } from "react"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"
import { PoolJoinFarmDeposit } from "./PoolJoinFarmDeposit"
import { PoolJoinFarmItem } from "./PoolJoinFarmItem"

export const PoolJoinFarm = (props: {
  poolId: string
  assetA: PoolToken
  assetB: PoolToken
  isOpen: boolean
  onClose: () => void
  onSelect: () => void
}) => {
  const { t } = useTranslation()
  const apr = useAPR(props.poolId)

  const [selectedYieldFarmId, setSelectedYieldFarmId] =
    useState<u32 | null>(null)

  const selectedFarm = selectedYieldFarmId
    ? apr.data.find((i) => i.yieldFarm.id.eq(selectedYieldFarmId))
    : null

  const modalProps: Partial<ComponentProps<typeof Modal>> =
    selectedYieldFarmId != null
      ? {
          title: t("pools.allFarms.detail.modal.title"),
          secondaryIcon: {
            icon: <ChevronRight css={{ transform: "rotate(180deg)" }} />,
            name: "Back",
            onClick: () => setSelectedYieldFarmId(null),
          },
        }
      : {
          title: t("pools.allFarms.modal.title", {
            symbol1: props.assetA.symbol,
            symbol2: props.assetB.symbol,
          }),
        }

  return (
    <Modal open={props.isOpen} onClose={props.onClose} {...modalProps}>
      <Box flex column gap={8} mt={24}>
        {selectedFarm != null ? (
          <Fragment key="detail">
            <PoolJoinFarmItem
              variant="detail"
              farm={selectedFarm}
              onSelect={() => console.log("test")}
            />

            <PoolJoinFarmDeposit
              poolId={props.poolId}
              assetIn={props.assetA}
              assetOut={props.assetB}
              farm={selectedFarm}
            />
          </Fragment>
        ) : (
          <Fragment key="list">
            {apr.data.map((farm) => (
              <PoolJoinFarmItem
                variant="list"
                key={farm.toString()}
                farm={farm}
                onSelect={() => {
                  setSelectedYieldFarmId(farm.yieldFarm.id)
                }}
              />
            ))}
          </Fragment>
        )}
      </Box>
    </Modal>
  )
}
