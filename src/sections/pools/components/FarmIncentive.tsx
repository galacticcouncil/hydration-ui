import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { SFarmIncentive } from "./FarmIncentive.styled"

type Props = {
  symbol: string
  apr: string
}

export const FarmIncentive = ({ symbol, apr }: Props) => (
  <SFarmIncentive>
    <div sx={{ flex: "row", align: "center", gap: 6 }}>
      <Icon size={24} icon={getAssetLogo(symbol)} />
      <Text>{symbol}</Text>
    </div>

    <Text color="brightBlue200">{apr}</Text>
  </SFarmIncentive>
)
