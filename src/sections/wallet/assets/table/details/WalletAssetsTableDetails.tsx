import { chains } from "@galacticcouncil/xcm"
import { ChainLogo } from "components/AssetIcon/AssetIcon"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useRpcProvider } from "providers/rpcProvider"
import { AssetsTableData } from "sections/wallet/assets/table/WalletAssetsTable.utils"
import { SContainer } from "./WalletAssetsTableDetails.styled"

export const WalletAssetsTableDetails = ({
  lockedDemocracy,
  lockedDemocracyDisplay,
  lockedVesting,
  lockedVestingDisplay,
  lockedStaking,
  lockedStakingDisplay,
  reserved,
  reservedDisplay,
  id,
}: AssetsTableData) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()

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

  return (
    <SContainer hasChain={!!asset?.chain}>
      {asset?.chain ? (
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
      ) : (
        <div aria-hidden></div>
      )}
      <div>
        <Text fs={14} lh={14} fw={500} color="basic300">
          {t("wallet.assets.table.details.lockedStaking")}
        </Text>
        <Text fs={16} lh={22} fw={400} color="white" sx={{ mt: 8 }}>
          {t("value.token", { value: lockedStaking })}
        </Text>
        <Text fs={11} lh={16} fw={500} color="whiteish500" sx={{ mt: 2 }}>
          <DisplayValue value={lockedStakingDisplay} />
        </Text>
      </div>
      <div>
        <Text fs={14} lh={14} fw={500} color="basic300">
          {t("wallet.assets.table.details.lockedDemocracy")}
        </Text>
        <Text fs={16} lh={22} fw={400} color="white" sx={{ mt: 8 }}>
          {t("value.token", { value: lockedDemocracy })}
        </Text>
        <Text fs={11} lh={16} fw={500} color="whiteish500" sx={{ mt: 2 }}>
          <DisplayValue value={lockedDemocracyDisplay} />
        </Text>
      </div>
      <div aria-hidden></div>
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
          {t("value.token", { value: lockedVesting })}
        </Text>
        <Text fs={11} lh={16} fw={500} color="whiteish500" sx={{ mt: 2 }}>
          <DisplayValue value={lockedVestingDisplay} />
        </Text>
      </div>
    </SContainer>
  )
}
