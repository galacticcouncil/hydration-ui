import { TFarmAprData } from "api/farms"
import { Alert } from "components/Alert/Alert"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Switch } from "components/Switch/Switch"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { FarmDetailsRow } from "sections/pools/farms/components/detailsCard/FarmDetailsRow"

type JoinFarmsSectionProps = {
  isJoinFarms: boolean
  isJoinFarmDisabled: boolean
  farms: TFarmAprData[]
  error?: string
  setIsJoinFarms: (v: boolean) => void
}

export const JoinFarmsSection = ({
  isJoinFarms,
  isJoinFarmDisabled,
  farms,
  error,
  setIsJoinFarms,
}: JoinFarmsSectionProps) => {
  const { t } = useTranslation()

  return (
    <>
      <SummaryRow
        label={t("liquidity.add.modal.joinFarms")}
        description={t("liquidity.add.modal.joinFarms.description")}
        content={
          <div sx={{ flex: "row", align: "center", gap: 8 }}>
            <Text fs={14} color="darkBlue200">
              {isJoinFarms ? t("yes") : t("no")}
            </Text>
            <Switch
              name="join-farms"
              value={isJoinFarms}
              onCheckedChange={setIsJoinFarms}
              disabled={isJoinFarmDisabled}
            />
          </div>
        }
      />
      {isJoinFarms && (
        <div sx={{ flex: "column", gap: 8, mt: 8 }}>
          {farms.map((farm) => {
            return <FarmDetailsRow key={farm.globalFarmId} farm={farm} />
          })}
        </div>
      )}
      {error && (
        <Alert variant="warning" sx={{ mt: 8 }}>
          {error}
        </Alert>
      )}
    </>
  )
}
