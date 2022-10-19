import { Text } from "components/Typography/Text/Text"
import { Separator } from "components/Separator/Separator"
import { FarmAssetIcon } from "./FarmAssetIcon"
import { AprFarm, getMinAndMaxAPR } from "utils/apr"
import { useTranslation } from "react-i18next"

type Props = {
  farms: AprFarm[]
}

export const MultiplePoolIncentivesRow = ({ farms }: Props) => {
  const { t } = useTranslation()

  return (
    <>
      <div sx={{ flex: "row", justify: "space-between" }}>
        <div sx={{ flex: "row" }}>
          {farms.map((farm, index) => (
            <FarmAssetIcon
              key={farm.assetId.toString()}
              assetId={farm.assetId}
              css={{
                right: `${index * 10}px`,
                position: "relative",
              }}
            />
          ))}
        </div>
        {!!farms.length && (
          <Text color="primary200">
            {t("value.multiAPR", getMinAndMaxAPR(farms))}
          </Text>
        )}
      </div>
      <Separator sx={{ mt: 18 }} />
    </>
  )
}
