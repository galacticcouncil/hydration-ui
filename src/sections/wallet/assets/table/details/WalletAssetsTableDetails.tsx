import { PolkadotRegistry } from "@galacticcouncil/sdk"
import { useAssetsLocation } from "api/assetDetails"
import BN from "bignumber.js"
import { ChainLogo } from "components/AssetIcon/AssetIcon"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Icon } from "components/Icon/Icon"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  lockedMax: BN
  lockedMaxDisplay: BN
  reserved: BN
  reservedDisplay: BN
  symbol: string
}

const registry = new PolkadotRegistry()

export const WalletAssetsTableDetails = ({
  lockedMax,
  lockedMaxDisplay,
  reserved,
  reservedDisplay,
  symbol,
}: Props) => {
  const { t } = useTranslation()

  const locations = useAssetsLocation()
  const chain = useMemo(() => {
    if (!locations.data) return undefined

    const location = locations.data?.find(
      (location) => location.symbol === symbol,
    )

    return registry
      .getChains()
      .find((chain) => chain.paraID === location?.parachainId)
  }, [symbol, locations])

  return (
    <div sx={{ flex: "row" }}>
      {chain && (
        <>
          <div sx={{ mx: "auto" }}>
            <Text fs={14} lh={14} fw={500} color="basic300">
              {t("wallet.assets.table.details.origin")}
            </Text>
            <div sx={{ flex: "row", gap: 8, mt: 12 }}>
              <Icon size={18} icon={<ChainLogo symbol={chain.id} />} />
              <Text fs={14} color="white">
                {chain.name}
              </Text>
            </div>
          </div>
          <Separator orientation="vertical" color="white" opacity={0.12} />
        </>
      )}
      <div sx={{ m: "auto" }}>
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
      <Separator orientation="vertical" color="white" opacity={0.12} />
      <div sx={{ m: "auto" }}>
        <Text fs={14} lh={14} fw={500} color="basic300">
          {t("wallet.assets.table.details.locked")}
        </Text>
        <Text fs={16} lh={22} fw={400} color="white" sx={{ mt: 8 }}>
          {t("value.token", { value: lockedMax })}
        </Text>
        <Text fs={11} lh={16} fw={500} color="whiteish500" sx={{ mt: 2 }}>
          <DisplayValue value={lockedMaxDisplay} />
        </Text>
      </div>
    </div>
  )
}
