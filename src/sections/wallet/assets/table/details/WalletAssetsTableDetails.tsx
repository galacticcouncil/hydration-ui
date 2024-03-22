import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { ChainLogo } from "components/AssetIcon/AssetIcon"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useRpcProvider } from "providers/rpcProvider"
import { SContainer } from "./WalletAssetsTableDetails.styled"
import {
  AssetsTableData,
  useLockedNativeTokens,
} from "sections/wallet/assets/table/data/WalletAssetsTableData.utils"
import BN from "bignumber.js"
import { useAccountVotes } from "api/democracy"

const chains = Array.from(chainsMap.values())

export const WalletAssetsTableDetails = ({
  reserved,
  reservedDisplay,
  id,
}: AssetsTableData) => {
  const {
    assets: { native },
  } = useRpcProvider()

  const isNativeAsset = id === native.id

  if (isNativeAsset)
    return (
      <NativeAssetDetails
        reserved={reserved}
        reservedDisplay={reservedDisplay}
      />
    )

  return (
    <AssetDetails
      reserved={reserved}
      reservedDisplay={reservedDisplay}
      id={id}
    />
  )
}

const NativeAssetDetails = ({
  reserved,
  reservedDisplay,
}: {
  reserved: BN
  reservedDisplay: BN
}) => {
  const { t } = useTranslation()
  const lockedTokens = useLockedNativeTokens()
  const votes = useAccountVotes()
  console.log(votes.data)

  return (
    <SContainer hasChain={false} isNativeAsset>
      <div>
        <Text fs={14} lh={14} fw={500} color="basic300">
          {t("wallet.assets.table.details.lockedStaking")}
        </Text>
        <Text fs={16} lh={22} fw={400} color="white" sx={{ mt: 8 }}>
          {t("value.token", { value: lockedTokens.lockStaking })}
        </Text>
        <Text fs={11} lh={16} fw={500} color="whiteish500" sx={{ mt: 2 }}>
          <DisplayValue value={lockedTokens.lockStakingDisplay} />
        </Text>
      </div>
      <div>
        <Text fs={14} lh={14} fw={500} color="basic300">
          {t("wallet.assets.table.details.lockedDemocracy")}
        </Text>
        <Text fs={16} lh={22} fw={400} color="white" sx={{ mt: 8 }}>
          {t("value.token", { value: lockedTokens.lockDemocracy })}
        </Text>
        <Text fs={11} lh={16} fw={500} color="whiteish500" sx={{ mt: 2 }}>
          <DisplayValue value={lockedTokens.lockDemocracyDisplay} />
        </Text>
      </div>
      <div>
        <Text fs={14} lh={14} fw={500} color="basic300">
          {t("wallet.assets.table.details.unlockable")}
        </Text>
        <Text fs={16} lh={22} fw={400} color="white" sx={{ mt: 8 }}>
          {t("value.token", { value: lockedTokens.lockDemocracy })}
        </Text>
        <Text fs={11} lh={16} fw={500} color="whiteish500" sx={{ mt: 2 }}>
          <DisplayValue value={lockedTokens.lockDemocracyDisplay} />
        </Text>
      </div>
      <div>
        <Text fs={14} lh={14} fw={500} color="basic300">
          {t("wallet.assets.table.details.reserved")}
        </Text>
        <Text fs={16} lh={22} fw={400} color="white" sx={{ mt: 8 }}>
          {t("value.token", { value: reserved })}
        </Text>
        <Text fs={11} lh={16} fw={500} color="whiteish500" sx={{ mt: 2 }}>
          <DisplayValue value={reservedDisplay} />
        </Text>
      </div>
      <div>
        <Text fs={14} lh={14} fw={500} color="basic300">
          {t("wallet.assets.table.details.lockedVesting")}
        </Text>
        <Text fs={16} lh={22} fw={400} color="white" sx={{ mt: 8 }}>
          {t("value.token", { value: lockedTokens.lockVesting })}
        </Text>
        <Text fs={11} lh={16} fw={500} color="whiteish500" sx={{ mt: 2 }}>
          <DisplayValue value={lockedTokens.lockVestingDisplay} />
        </Text>
      </div>
    </SContainer>
  )
}

const AssetDetails = ({
  reserved,
  reservedDisplay,
  id,
}: {
  reserved: BN
  reservedDisplay: BN
  id: string
}) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()

  const origin = useMemo(() => {
    const assetDetails = assets.getAsset(id)

    const chain = chains.find(
      (chain) => chain.parachainId === Number(assetDetails.parachainId),
    )

    if (!chain) return undefined

    return {
      chain: chain.key,
      name: chain.name,
      symbol: assetDetails.symbol,
    }
  }, [assets, id])

  return (
    <SContainer hasChain={!!origin} isNativeAsset={false}>
      {origin && (
        <div>
          <Text fs={14} lh={14} fw={500} color="basic300">
            {t("wallet.assets.table.details.origin")}
          </Text>
          <div sx={{ flex: "row", gap: 8, mt: 12 }}>
            <Icon size={18} icon={<ChainLogo symbol={origin.chain} />} />
            <Text fs={14} color="white">
              {origin.name}
            </Text>
          </div>
        </div>
      )}
      <div>
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
    </SContainer>
  )
}
