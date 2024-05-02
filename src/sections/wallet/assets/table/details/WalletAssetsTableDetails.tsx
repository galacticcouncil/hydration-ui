import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { ChainLogo } from "components/AssetIcon/AssetIcon"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useMemo } from "react"
import Skeleton from "react-loading-skeleton"
import { useTranslation } from "react-i18next"
import { useRpcProvider } from "providers/rpcProvider"
import { SContainer } from "./WalletAssetsTableDetails.styled"
import { NATIVE_ASSET_ID } from "utils/api"
import {
  AssetsTableData,
  useLockedValues,
} from "sections/wallet/assets/table/data/WalletAssetsTableData.utils"
import { AnyParachain } from "@galacticcouncil/xcm-core"

//@ts-ignore
const chains = Array.from(chainsMap.values()) as AnyParachain[]

export const WalletAssetsTableDetails = ({
  reserved,
  reservedDisplay,
  id,
}: AssetsTableData) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()

  const lockedValues = useLockedValues(id)

  const asset = useMemo(() => {
    const assetDetails = assets.getAsset(id)

    const chain = chains.find(
      (chain) => chain.parachainId === Number(assetDetails.parachainId),
    )

    return {
      chain: chain?.key,
      name: chain?.name,
      symbol: assetDetails.symbol,
    }
  }, [assets, id])

  const isNativeAsset = id === NATIVE_ASSET_ID
  const hasChain = !!asset?.chain

  return (
    <SContainer hasChain={hasChain} isNativeAsset={isNativeAsset}>
      {hasChain && (
        <div>
          <Text fs={14} lh={14} fw={500} color="basic300">
            {t("wallet.assets.table.details.origin")}
          </Text>
          <div sx={{ flex: "row", gap: 8, mt: 12 }}>
            <Icon size={18} icon={<ChainLogo symbol={asset?.chain} />} />
            <Text fs={14} color="white">
              {asset?.name}
            </Text>
          </div>
        </div>
      )}
      {isNativeAsset && (
        <div sx={{ flex: "column", align: "start", gap: 4 }}>
          <Text fs={14} lh={14} fw={500} color="basic300">
            {t("wallet.assets.table.details.lockedStaking")}
          </Text>
          {lockedValues.isLoading ? (
            <Skeleton height={20} width={50} />
          ) : (
            <Text fs={16} lh={22} fw={400} color="white">
              {t("value.token", { value: lockedValues.data?.lockedStaking })}
            </Text>
          )}
          {lockedValues.isLoading ? (
            <Skeleton height={16} width={30} />
          ) : (
            <Text fs={11} lh={16} fw={500} color="whiteish500">
              <DisplayValue value={lockedValues.data?.lockedStakingDisplay} />
            </Text>
          )}
        </div>
      )}
      {isNativeAsset && (
        <div sx={{ flex: "column", align: "start", gap: 4 }}>
          <Text fs={14} lh={14} fw={500} color="basic300">
            {t("wallet.assets.table.details.lockedDemocracy")}
          </Text>
          {lockedValues.isLoading ? (
            <Skeleton height={22} width={50} />
          ) : (
            <Text fs={16} lh={22} fw={400} color="white">
              {t("value.token", { value: lockedValues.data?.lockedDemocracy })}
            </Text>
          )}
          {lockedValues.isLoading ? (
            <Skeleton height={16} width={30} />
          ) : (
            <Text fs={11} lh={16} fw={500} color="whiteish500">
              <DisplayValue value={lockedValues.data?.lockedDemocracyDisplay} />
            </Text>
          )}
        </div>
      )}
      <div sx={{ flex: "column", align: "start", gap: 4 }}>
        <Text fs={14} lh={14} fw={500} color="basic300">
          {t("wallet.assets.table.details.reserved")}
        </Text>
        <Text fs={16} lh={22} fw={400} color="white">
          {t("value.token", { value: reserved })}
        </Text>
        <Text fs={11} lh={16} fw={500} color="whiteish500">
          <DisplayValue value={reservedDisplay} />
        </Text>
      </div>
      {isNativeAsset && (
        <div sx={{ flex: "column", align: "start", gap: 4 }}>
          <Text fs={14} lh={14} fw={500} color="basic300">
            {t("wallet.assets.table.details.lockedVesting")}
          </Text>
          {lockedValues.isLoading ? (
            <Skeleton height={22} width={50} />
          ) : (
            <Text fs={16} lh={22} fw={400} color="white">
              {t("value.token", { value: lockedValues.data?.lockedVesting })}
            </Text>
          )}
          {lockedValues.isLoading ? (
            <Skeleton height={16} width={30} />
          ) : (
            <Text fs={11} lh={16} fw={500} color="whiteish500">
              <DisplayValue value={lockedValues.data?.lockedVestingDisplay} />
            </Text>
          )}
        </div>
      )}
    </SContainer>
  )
}
