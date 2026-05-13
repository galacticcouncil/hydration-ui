import { Button, FormField, Input, Stack } from "@galacticcouncil/ui/components"
import { Control, Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { MultisigSetupFormValues } from "@/components/multisig/MultisigSetup.form"

type NameStepProps = {
  control: Control<MultisigSetupFormValues>
  onContinue: () => void
  canContinue: boolean
}

export const NameStep: React.FC<NameStepProps> = ({
  control,
  onContinue,
  canContinue,
}) => {
  const { t } = useTranslation()

  return (
    <Stack gap="m" p="xl" pt={0}>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <FormField
            label={t("multisig.setup.nameLabel")}
            error={error?.message}
          >
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value.slice(0, 32))}
              placeholder={t("multisig.setup.namePlaceholder")}
              isError={!!error}
            />
          </FormField>
        )}
      />

      <Button
        variant={canContinue ? "secondary" : "tertiary"}
        size="large"
        type="button"
        disabled={!canContinue}
        onClick={onContinue}
        width="100%"
        sx={{ mt: "s" }}
      >
        {t("multisig.setup.new.continueToSummary")}
      </Button>
    </Stack>
  )
}
