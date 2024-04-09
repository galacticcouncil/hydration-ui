import { u32 } from "@polkadot/types"
import { Farm } from "api/farms"
import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { TMiningNftPosition } from "sections/pools/PoolsPage.utils"
import { FarmDepositMutationType } from "utils/farms/deposit"
import { FarmRedepositMutationType } from "utils/farms/redeposit"
import { FarmDetailsCard } from "sections/pools/farms/components/detailsCard/FarmDetailsCard"
import { FarmDetailsModal } from "sections/pools/farms/modals/details/FarmDetailsModal"
import { SJoinFarmContainer } from "./JoinFarmsModal.styled"
import { useBestNumber } from "api/chain"
import { useRpcProvider } from "providers/rpcProvider"
import { Alert } from "components/Alert/Alert"
import { Controller, useForm } from "react-hook-form"
import { scaleHuman } from "utils/balance"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { useZodSchema } from "./JoinFarmsModal.utils"
import { zodResolver } from "@hookform/resolvers/zod"

type JoinFarmModalProps = {
  isOpen: boolean
  onClose: () => void
  poolId: string
  initialShares?: BigNumber
  farms: Farm[]
  isRedeposit?: boolean
  mutation?: FarmDepositMutationType | FarmRedepositMutationType
  depositNft?: TMiningNftPosition
}

export const JoinFarmModal = ({
  isOpen,
  onClose,
  isRedeposit,
  poolId,
  mutation,
  initialShares,
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

  const zodSchema = useZodSchema(meta.id, farms)

  const form = useForm<{ amount: string }>({
    mode: "onChange",
    defaultValues: {
      amount: initialShares
        ? scaleHuman(initialShares, meta.decimals).toString()
        : undefined,
    },
    resolver: zodSchema ? zodResolver(zodSchema) : undefined,
  })

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

  const onSubmit = () => mutation?.mutate()

  const error = form.formState.errors.amount?.message

  return (
    <Modal open={isOpen} onClose={onClose} disableCloseOutside>
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
                {mutation && (
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    autoComplete="off"
                  >
                    <SJoinFarmContainer>
                      {initialShares ? (
                        <div
                          sx={{
                            flex: ["column", "row"],
                            justify: "space-between",
                            p: 30,
                            gap: [4, 120],
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
                              value: initialShares,
                              fixedPointScale: meta.decimals,
                            })}
                          </Text>
                        </div>
                      ) : (
                        <Controller
                          name="amount"
                          control={form.control}
                          render={({
                            field: { name, value, onChange },
                            fieldState: { error },
                          }) => (
                            <WalletTransferAssetSelect
                              title={t(
                                "wallet.assets.transfer.asset.label_mob",
                              )}
                              name={name}
                              value={value}
                              onChange={onChange}
                              asset={poolId}
                              error={error?.message}
                            />
                          )}
                        />
                      )}

                      {error && initialShares && (
                        <Alert variant="error" css={{ margin: "20px 0" }}>
                          {error}
                        </Alert>
                      )}

                      <Button
                        fullWidth
                        variant="primary"
                        isLoading={mutation.isLoading}
                        disabled={!!error || !zodSchema}
                      >
                        {t("farms.modal.join.button.label", {
                          count: farms.length,
                        })}
                      </Button>
                    </SJoinFarmContainer>
                  </form>
                )}
              </>
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
