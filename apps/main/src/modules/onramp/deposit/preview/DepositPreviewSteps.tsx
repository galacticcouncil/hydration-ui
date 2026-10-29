import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { FC, useEffect } from "react"
import { useFormContext } from "react-hook-form"

import { useDepositAccounts } from "@/modules/onramp/deposit/hooks/useDepositAccounts"
import { DepositAssetCatalog } from "@/modules/onramp/deposit/preview/steps/DepositAssetCatalog"
import { DepositDestination } from "@/modules/onramp/deposit/preview/steps/DepositDestination"
import { DepositHydrationTransfer } from "@/modules/onramp/deposit/preview/steps/DepositHydrationTransfer"
import { DepositPreviewAsset } from "@/modules/onramp/deposit/preview/steps/DepositPreviewAsset"
import { DepositPreviewForm } from "@/modules/onramp/deposit/preview/steps/DepositPreviewForm"
import { DepositSources } from "@/modules/onramp/deposit/preview/steps/DepositSources"
import { DepositTracking } from "@/modules/onramp/deposit/preview/steps/DepositTracking"
import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { DepositGuidedAsset } from "@/modules/onramp/deposit/variants/DepositGuidedAsset"
import { DepositQuickStart } from "@/modules/onramp/deposit/variants/DepositQuickStart"
import { DepositVariantSource } from "@/modules/onramp/deposit/variants/DepositVariantSource"
import {
  DepositVariant,
  useOnrampModal,
} from "@/modules/onramp/store/useOnrampModal"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"

export const DepositPreviewSteps: FC<{ variant?: DepositVariant }> = ({
  variant = "preview",
}) => {
  const phase = useDepositJourneyStore((state) => state.phase)
  const directEntry = useOnrampModal((state) => state.depositEntryChoice)
  const intent = useDepositJourneyStore((state) => state.assetIntent)
  const destinationAddress = useDepositJourneyStore(
    (state) => state.destinationAddress,
  )
  const recipients = useDepositAccounts({ signersOnly: true })
  const receiver = useDepositJourneyStore((state) => state.destinationAccount)
  const isReceiverAvailable =
    !!receiver &&
    receiver.canUseOnHydration &&
    recipients.some(
      (item) =>
        item.provider === receiver.provider &&
        item.address === receiver.address,
    )
  const selection = useDepositJourneyStore((state) => state.selection)
  useEffect(() => {
    if (phase === "amount" && !selection)
      useDepositJourneyStore.getState().setPhase("assets")
    else if (
      phase === "amount" &&
      (!destinationAddress || !isReceiverAvailable)
    ) {
      useDepositJourneyStore.setState({ destinationConfirmed: false })
      useDepositJourneyStore.getState().setPhase("destination")
    }
  }, [phase, destinationAddress, selection, isReceiverAvailable])
  const { watch } = useFormContext<XcmFormValues>()
  useEffect(() => {
    const subscription = watch((values, info) => {
      if (
        info.name === "srcAmount" &&
        (useDepositJourneyStore.getState().phase === "amount" ||
          ((variant === "guided" || variant === "simple") &&
            useDepositJourneyStore.getState().phase === "sources"))
      )
        useDepositJourneyStore.getState().setAmount(values.srcAmount ?? "")
    })
    return () => subscription.unsubscribe()
  }, [watch, variant])

  if (variant !== "preview") {
    const journey = useDepositJourneyStore.getState()
    if (
      intent?.chainKey === HYDRATION_CHAIN_KEY &&
      intent.assetKey === "hdx" &&
      !(variant === "simple" && directEntry) &&
      phase !== "catalog" &&
      phase !== "tracking"
    )
      return (
        <DepositHydrationTransfer
          onBack={() => {
            if (variant === "guided") journey.setPhase("catalog")
            else
              useDepositJourneyStore.setState({
                assetIntent: null,
                selection: null,
                amount: "",
                phase: "assets",
              })
          }}
        />
      )
    if (variant === "simple" && phase !== "tracking")
      return <DepositQuickStart />
    if (
      variant === "guided" &&
      ["sources", "destination", "amount"].includes(phase)
    )
      return (
        <DepositVariantSource
          inlineDestination
          onBack={() => journey.setPhase("catalog")}
        />
      )
    switch (phase) {
      case "tracking":
        return <DepositTracking />
      case "destination":
        return (
          <DepositDestination
            onBack={() =>
              journey.setPhase(
                journey.destinationConfirmed ? "amount" : "sources",
              )
            }
          />
        )
      case "sources":
        return (
          <DepositVariantSource
            inlineDestination={variant === "guided"}
            onBack={() =>
              journey.setPhase(variant === "guided" ? "catalog" : "assets")
            }
          />
        )
      case "amount":
        return <DepositPreviewForm variant={variant} />
      default:
        return variant === "guided" ? (
          <DepositGuidedAsset />
        ) : (
          <DepositQuickStart />
        )
    }
  }

  switch (phase) {
    case "catalog":
      return <DepositAssetCatalog />
    case "sources":
      return <DepositSources />
    case "destination":
      return <DepositDestination />
    case "assets":
      return <DepositPreviewAsset />
    case "tracking":
      return <DepositTracking />
    default:
      return <DepositPreviewForm />
  }
}
