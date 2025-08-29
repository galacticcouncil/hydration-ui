import { TFarmAprData } from "api/farms"
import { Alert } from "components/Alert/Alert"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Switch } from "components/Switch/Switch"
import { Text } from "components/Typography/Text/Text"
import { useEffect } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { FarmDetailsRow } from "sections/pools/farms/components/detailsCard/FarmDetailsRow"

type JoinFarmsSectionProps = {
  name: string
  isJoinFarms: boolean
  farms: TFarmAprData[]
  error?: string
  setIsJoinFarms: (v: boolean) => void
}

export const JoinFarmsSection = ({
  name,
  isJoinFarms,
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
              name={name}
              value={isJoinFarms}
              onCheckedChange={setIsJoinFarms}
              disabled={!!error}
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

export const AvailableFarmsForm = ({
  name,
  farms,
  isJoinFarms,
  setIsJoinFarms,
}: {
  name: string
  farms: TFarmAprData[]
  isJoinFarms: boolean
  setIsJoinFarms: (state: boolean) => void
}) => {
  const form = useFormContext()
  const isFarms = farms.length
  const { errors } = form.formState

  const isFarmsErrors = errors[name]

  useEffect(() => {
    if (isFarmsErrors) {
      setIsJoinFarms(false)
    } else {
      setIsJoinFarms(true)
    }
  }, [isFarmsErrors, setIsJoinFarms])

  if (!isFarms) return null

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field: { name }, fieldState: { error } }) => (
        <JoinFarmsSection
          name={name}
          farms={farms}
          isJoinFarms={isJoinFarms}
          setIsJoinFarms={setIsJoinFarms}
          error={error?.message}
        />
      )}
    />
  )
}
