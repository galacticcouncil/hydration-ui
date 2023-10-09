import { u32 } from "@polkadot/types"
import { DepositNftType } from "api/deposits"
import { Farm } from "api/farms"
import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { Modal, ModalScrollableContent } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { FarmDepositMutationType } from "utils/farms/deposit"
import { FarmRedepositMutationType } from "utils/farms/redeposit"
import { FarmDetailsCard } from "sections/pools/farms/components/detailsCard/FarmDetailsCard"
import { FarmDetailsModal } from "sections/pools/farms/modals/details/FarmDetailsModal"
import { SJoinFarmContainer } from "./JoinFarmsModal.styled"
import { useBestNumber } from "api/chain"
import { useRpcProvider } from "providers/rpcProvider"

type JoinFarmModalProps = {
  isOpen: boolean
  onClose: () => void
  poolId: u32
  shares?: BigNumber
  farms: Farm[]
  isRedeposit?: boolean
  mutation?: FarmDepositMutationType | FarmRedepositMutationType
  depositNft?: DepositNftType
}

export const JoinFarmModal = ({
  isOpen,
  onClose,
  isRedeposit,
  poolId,
  mutation,
  shares,
  depositNft,
  farms,
}: JoinFarmModalProps) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const [selectedFarmId, setSelectedFarmId] = useState<{
    yieldFarmId: u32
    globalFarmId: u32
  } | null>(null)
  const meta = assets.getAsset(poolId.toString())
  const bestNumber = useBestNumber()

  const selectedFarm = farms.find(
    (farm) =>
      farm.globalFarm.id.eq(selectedFarmId?.globalFarmId) &&
      farm.yieldFarm.id.eq(selectedFarmId?.yieldFarmId),
  )

  const { page, direction, back, next } = useModalPagination()

  const onBack = () => {
    back()
    setSelectedFarmId(null)
  }

  const currentBlock = bestNumber.data?.relaychainBlockNumber
    .toBigNumber()
    .dividedToIntegerBy(
      selectedFarm?.globalFarm.blocksPerPeriod.toNumber() ?? 1,
    )

  return (
    <Modal open={isOpen} onClose={onClose}>
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
              <ModalScrollableContent
                content={
                  <>
                    {isRedeposit && (
                      <Text color="basic400">
                        {t("farms.modal.join.description", {
                          assets: meta.symbol,
                        })}
                      </Text>
                    )}
                    <div sx={{ flex: "column", gap: 8, mt: 24 }}>
                      {farms.map((farm, i) => {
                        return (
                          <FarmDetailsCard
                            key={i}
                            poolId={poolId}
                            farm={farm}
                            depositNft={depositNft}
                            onSelect={() => {
                              setSelectedFarmId({
                                globalFarmId: farm.globalFarm.id,
                                yieldFarmId: farm.yieldFarm.id,
                              })
                              next()
                            }}
                          />
                        )
                      })}
                    </div>
                  </>
                }
                footer={
                  mutation &&
                  shares && (
                    <SJoinFarmContainer>
                      <div
                        sx={{
                          flex: "row",
                          justify: "space-between",
                          p: 30,
                          gap: 120,
                        }}
                      >
                        <div sx={{ flex: "column", gap: 13 }}>
                          <Text>{t("farms.modal.footer.title")}</Text>
                        </div>
                        <Text
                          color="pink600"
                          fs={24}
                          css={{ whiteSpace: "nowrap" }}
                        >
                          {t("value.token", {
                            value: shares,
                            fixedPointScale: meta.decimals,
                          })}
                        </Text>
                      </div>
                      <Button
                        fullWidth
                        variant="primary"
                        onClick={() => mutation.mutate()}
                        isLoading={mutation.isLoading}
                      >
                        {t("farms.modal.join.button.label", {
                          count: farms.length,
                        })}
                      </Button>
                    </SJoinFarmContainer>
                  )
                }
              ></ModalScrollableContent>
            ),
          },
          {
            title: t("farms.modal.details.title"),
            content: selectedFarm && (
              <FarmDetailsModal
                poolId={poolId}
                farm={selectedFarm}
                depositNft={depositNft}
                currentBlock={currentBlock?.toNumber()}
              />
            ),
          },
        ]}
      />
    </Modal>
  )
}
