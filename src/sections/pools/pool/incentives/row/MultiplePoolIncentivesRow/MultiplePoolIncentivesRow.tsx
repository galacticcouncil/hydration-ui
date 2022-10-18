import { Text } from "components/Typography/Text/Text"
import { Separator } from "components/Separator/Separator"
import FarmAssetIcon from "./FarmAssetIcon"
import { AprFarm, getMinAndMaxAPR } from "utils/apr"
import { useTranslation } from "react-i18next"

type Props = {
  farms: AprFarm[]
}

const MultiplePoolIncentivesRow = ({ farms }: Props) => {
  const { t } = useTranslation()

  return (
    <>
      <div sx={{ flex: "row", justify: "space-between" }}>
        <div sx={{ flex: "row" }}>
          {farms.map((farm, index) => (
            <FarmAssetIcon
              key={String(farm.assetId)}
              assetId={farm.assetId}
              styles={{ right: `${index * 12}px` }}
            />
          ))}
        </div>
        {!!farms.length ? (
          <Text color="primary200">
            {t("value.multiAPR", getMinAndMaxAPR(farms))}
          </Text>
        ) : null}
      </div>
      <Separator sx={{ mt: 18 }} />
    </>
  )
}

export default MultiplePoolIncentivesRow
