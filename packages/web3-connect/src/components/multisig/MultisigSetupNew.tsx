import { Collapsible, Separator, Stack } from "@galacticcouncil/ui/components"
import { isSS58Address } from "@galacticcouncil/utils"
import { useMemo, useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { NameStep } from "@/components/multisig/components/NameStep"
import { SignersStep } from "@/components/multisig/components/SignersStep"
import { StepTrigger } from "@/components/multisig/components/StepTrigger"
import { SummaryStep } from "@/components/multisig/components/SummaryStep"
import { ThresholdStep } from "@/components/multisig/components/ThresholdStep"
import {
  getSignerValueErrorAtIndex,
  MultisigSetupFormValues,
} from "@/components/multisig/MultisigSetup.form"
import { useActivateMultisig } from "@/hooks/useActivateMultisig"
import { MultisigConfig, useMultisigStore } from "@/hooks/useMultisigStore"
import { deriveMultisigAddress } from "@/utils/multisig"

type Step = "signers" | "threshold" | "name" | "summary"

type Props = {
  isSignerPrefilled?: boolean
  onContinue: () => void
}

const MIN_SIGNERS = 2

export const MultisigSetupNew: React.FC<Props> = ({
  isSignerPrefilled,
  onContinue,
}) => {
  const { t } = useTranslation()
  const { add, setActive } = useMultisigStore()
  const { activate } = useActivateMultisig()

  const [activeStep, setActiveStep] = useState<Step>("signers")
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set())

  const form = useFormContext<MultisigSetupFormValues>()
  const {
    control,
    watch,
    setValue,
    formState: { isValid, errors },
  } = form

  const {
    fields,
    append,
    remove: removeField,
  } = useFieldArray({
    control,
    name: "signers",
  })

  const signers = watch("signers")
  const threshold = watch("threshold")
  const name = watch("name")

  const validSigners = useMemo(
    () => signers.map((s) => s.value).filter((v) => v && isSS58Address(v)),
    [signers],
  )

  const derivedAddress = useMemo(() => {
    if (validSigners.length < MIN_SIGNERS) return ""
    return deriveMultisigAddress(validSigners, threshold)
  }, [validSigners, threshold])

  // Clamp threshold when valid signer count changes
  useMemo(() => {
    if (validSigners.length >= MIN_SIGNERS && threshold > validSigners.length) {
      setValue("threshold", validSigners.length, { shouldValidate: true })
    }
  }, [validSigners.length, threshold, setValue])

  const handleAddSigner = (proposedLastValue?: string) => {
    const messages = {
      invalid: t("multisig.setup.error.invalid"),
      duplicate: t("multisig.setup.error.duplicate"),
      thresholdExceedsSigners: t(
        "multisig.setup.error.thresholdExceedsSigners",
      ),
    }
    const lastIndex = fields.length - 1
    const mergedSigners =
      proposedLastValue !== undefined
        ? signers.map((s, i) =>
            i === lastIndex ? { value: proposedLastValue } : s,
          )
        : signers
    const lastValue = mergedSigners[lastIndex]?.value ?? ""
    if (!lastValue.trim()) return
    if (getSignerValueErrorAtIndex(mergedSigners, lastIndex, messages)) {
      return
    }
    if (proposedLastValue !== undefined) {
      setValue(`signers.${lastIndex}.value`, proposedLastValue, {
        shouldValidate: true,
      })
    }
    append({ value: "" })
  }

  const handleRemoveSigner = (index: number) => {
    removeField(index)
  }

  const handleSave = () => {
    if (!isValid) return

    const config: Omit<MultisigConfig, "id"> = {
      name: name,
      signers: validSigners,
      threshold,
      address: derivedAddress,
      isCustom: true,
    }

    add(config)
    const newConfig = useMultisigStore.getState().configs.at(-1)
    if (!newConfig) return

    if (isSignerPrefilled) {
      activate(newConfig, signers[0].value)
      onContinue()
      return
    }

    setActive(newConfig.id, null)
    onContinue()
  }

  const advanceTo = (next: Step) => {
    setCompletedSteps((prev) => {
      const updated = new Set(prev)
      updated.add(activeStep)
      return updated
    })
    setActiveStep(next)
  }

  const handleOpenStep = (step: Step, open: boolean) => {
    if (!open) return
    if (step === activeStep || completedSteps.has(step)) {
      setActiveStep(step)
    }
  }

  const signersComplete = completedSteps.has("signers")
  const thresholdComplete = completedSteps.has("threshold")
  const nameComplete = completedSteps.has("name")

  const getStepState = (step: Step) => {
    if (completedSteps.has(step)) return "done" as const
    if (activeStep === step) return "active" as const
    return "todo" as const
  }

  const canContinueFromSigners =
    validSigners.length >= MIN_SIGNERS && !errors.signers

  const canContinueFromName = name.trim().length > 0 && !errors.name

  return (
    <Stack>
      <Collapsible
        trigger={
          <StepTrigger
            stepNumber={1}
            state={getStepState("signers")}
            title={t("multisig.setup.signersLabel")}
            description={
              signersComplete
                ? t("multisig.setup.new.signersDescription.complete", {
                    count: validSigners.length,
                  })
                : t("multisig.setup.new.signersDescription.incomplete", {
                    count: validSigners.length,
                  })
            }
          />
        }
        open={activeStep === "signers"}
        onOpenChange={(open) => {
          handleOpenStep("signers", open)
        }}
      >
        <SignersStep
          fields={fields}
          signers={signers}
          errors={errors}
          control={control}
          onAddSigner={handleAddSigner}
          onRemoveSigner={handleRemoveSigner}
          onContinue={() => advanceTo("threshold")}
          canContinue={canContinueFromSigners}
        />
      </Collapsible>

      <Separator />

      <Collapsible
        trigger={
          <StepTrigger
            stepNumber={2}
            state={getStepState("threshold")}
            title={t("multisig.setup.thresholdLabel")}
            description={
              thresholdComplete
                ? t("multisig.setup.new.thresholdDescription.complete", {
                    threshold,
                    count: validSigners.length,
                  })
                : t("multisig.setup.new.thresholdDescription.incomplete", {
                    threshold,
                    count: validSigners.length,
                  })
            }
          />
        }
        open={activeStep === "threshold"}
        onOpenChange={(open) => handleOpenStep("threshold", open)}
      >
        <ThresholdStep
          validSignerCount={validSigners.length}
          threshold={threshold}
          onThresholdChange={(n) =>
            setValue("threshold", n, { shouldValidate: true })
          }
          onContinue={() => advanceTo("name")}
        />
      </Collapsible>

      <Separator />

      <Collapsible
        trigger={
          <StepTrigger
            stepNumber={3}
            state={getStepState("name")}
            title={t("multisig.setup.nameLabel")}
            description={
              nameComplete
                ? name.trim()
                : t("multisig.setup.new.nameDescription.incomplete")
            }
          />
        }
        open={activeStep === "name"}
        onOpenChange={(open) => handleOpenStep("name", open)}
      >
        <NameStep
          control={control}
          onContinue={() => advanceTo("summary")}
          canContinue={canContinueFromName}
        />
      </Collapsible>

      <Separator />

      <Collapsible
        trigger={
          <StepTrigger
            stepNumber={4}
            state={getStepState("summary")}
            title={t("multisig.setup.new.step.summary")}
            description={t("multisig.setup.new.summaryDescription.incomplete")}
          />
        }
        open={activeStep === "summary"}
        onOpenChange={(open) => handleOpenStep("summary", open)}
      >
        <SummaryStep
          name={name}
          derivedAddress={derivedAddress}
          signers={validSigners}
          threshold={threshold}
          signerCount={validSigners.length}
          isValid={isValid}
          onSave={handleSave}
        />
      </Collapsible>
    </Stack>
  )
}
