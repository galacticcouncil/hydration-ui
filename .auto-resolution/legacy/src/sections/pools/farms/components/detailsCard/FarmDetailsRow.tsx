import { useBestNumber } from "api/chain"
import { Farm, useFarmApr } from "api/farms"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { addSeconds } from "date-fns"
import { useAssets } from "providers/assets"
import { useTranslation } from "react-i18next"
import { BLOCK_TIME } from "utils/constants"
import { SContainer } from "./FarmDetailsRow.styled"
import { Modal } from "components/Modal/Modal"
import { FarmDetailsModal } from "sections/pools/farms/modals/details/FarmDetailsModal"
import { useState } from "react"
import ChevronRightIcon from "assets/icons/ChevronRight.svg?react"

type FarmDetailsRowProps = {
  farm: Farm
}

export const FarmDetailsRow = ({ farm }: FarmDetailsRowProps) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()
  const [detailOpen, setDetailOpen] = useState(false)

  const asset = getAssetWithFallback(farm.globalFarm.rewardCurrency.toString())
  const apr = useFarmApr(farm)

  const { relaychainBlockNumber } = useBestNumber().data ?? {}

  const secondsDurationToEnd = relaychainBlockNumber
    ? apr.data?.estimatedEndBlock
        .minus(relaychainBlockNumber.toBigNumber())
        .times(BLOCK_TIME)
        .toNumber()
    : undefined

  if (!apr.data) return null

  const currentBlock = relaychainBlockNumber
    ?.toBigNumber()
    .dividedToIntegerBy(farm?.globalFarm.blocksPerPeriod.toNumber() ?? 1)

  return (
    <>
      <SContainer onClick={() => setDetailOpen(true)}>
        <div sx={{ flex: "row", align: "center", gap: 8, width: 70 }}>
          <Icon size={20} icon={<AssetLogo id={asset.id} />} />
          <Text fs={14} font="GeistMedium">
            {asset.symbol}
          </Text>
        </div>
        <Separator
          orientation="vertical"
          color="white"
          size={1}
          opacity={0.06}
          sx={{ height: 15 }}
        />
        <div>
          <Text fs={12} lh={12} color="brightBlue300" font="GeistMedium">
            {apr.data?.apr?.gt(0) && t("value.APR", { apr: apr.data.apr })}
          </Text>
        </div>
        <div sx={{ ml: "auto", flex: "row", align: "center" }}>
          <Text fs={12} lh={12} color="basic100" font="GeistMedium">
            {secondsDurationToEnd != null &&
              t("farms.details.card.end.value", {
                end: addSeconds(new Date(), secondsDurationToEnd),
              })}
          </Text>
          <Icon
            sx={{ color: "darkBlue300", mr: -10 }}
            size={20}
            icon={<ChevronRightIcon />}
          />
        </div>
      </SContainer>
      {detailOpen && (
        <Modal
          open
          title={t("farms.modal.details.title")}
          onClose={() => setDetailOpen(false)}
        >
          <FarmDetailsModal
            farm={farm}
            currentBlock={currentBlock?.toNumber()}
          />
        </Modal>
      )}
    </>
  )
}
